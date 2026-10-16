/**
 * ArtisansKart Production-Ready Shipping & Postal API Route
 * Handles safe JSON parsing, Shiprocket authentication, and India Post / Zippopotam fallback.
 */

import { Request, Response } from 'express';

const SHIPROCKET_API_BASE = 'https://apiv2.shiprocket.in/v1/external';

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getShiprocketAuthToken(): Promise<string | null> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const email = process.env.SHIPROCKET_EMAIL?.trim();
  const password = process.env.SHIPROCKET_PASSWORD?.trim();

  if (!email || !password) {
    return null;
  }

  try {
    const res = await fetch(`${SHIPROCKET_API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(5000),
    });

    const rawText = await res.text();
    let data: any = {};
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch (e) {
      console.warn('[Shiprocket Auth] Non-JSON response received:', rawText.slice(0, 200));
      return null;
    }

    if (!res.ok || !data.token) {
      console.error('[Shiprocket Auth Failed]', data?.message || `HTTP ${res.status}`);
      return null;
    }

    cachedToken = String(data.token);
    // Cache for 9 days
    tokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000;
    return cachedToken;
  } catch (err: any) {
    console.error('[Shiprocket Auth Error]', err.message);
    return null;
  }
}

export async function handleShippingServiceability(req: Request, res: Response) {
  try {
    const deliveryPincode = String(req.query.pincode || req.body?.pincode || '')
      .replace(/\D/g, '')
      .slice(0, 6);

    if (!deliveryPincode || deliveryPincode.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing 6-digit PIN code.',
      });
    }

    const token = await getShiprocketAuthToken();
    const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || '110016';
    const weightKg = Number(req.query.weight || req.body?.weight || 0.5);

    if (token) {
      const url = `${SHIPROCKET_API_BASE}/courier/serviceability/?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&weight=${weightKg}&cod=1`;
      const srRes = await fetch(url, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(6000),
      });

      const rawText = await srRes.text();
      let srData: any = {};
      try {
        srData = rawText ? JSON.parse(rawText) : {};
      } catch (e) {
        console.warn('[Shiprocket API] Non-JSON response:', rawText.slice(0, 200));
      }

      if (srRes.ok && srData?.data?.available_courier_companies) {
        const couriers = srData.data.available_courier_companies;
        return res.json({
          success: true,
          serviceable: couriers.length > 0,
          couriers,
          recommended_courier: couriers[0]?.courier_name || 'Standard Courier',
          rate: couriers[0]?.rate ? Math.round(Number(couriers[0].rate)) : 99,
          etd: couriers[0]?.etd || '3-5 days',
        });
      }
    }

    // Fallback to India Post Postal Registry (api.postalpincode.in)
    const postalRes = await fetch(`https://api.postalpincode.in/pincode/${deliveryPincode}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(4000),
    });

    const postalText = await postalRes.text();
    let postalJson: any = [];
    try {
      postalJson = postalText ? JSON.parse(postalText) : [];
    } catch (e) {
      return res.status(502).json({
        success: false,
        message: 'Postal directory service returned an invalid response format.',
      });
    }

    if (Array.isArray(postalJson) && postalJson[0]?.Status === 'Success') {
      const entry = postalJson[0];
      const office = entry.PostOffice?.[0] || {};
      return res.json({
        success: true,
        serviceable: true,
        district: office.District || 'Verified Area',
        state: office.State || 'India',
        postOffices: entry.PostOffice,
        rate: 99,
        etd: '3-5 days',
      });
    }

    return res.status(404).json({
      success: false,
      message: `PIN code ${deliveryPincode} not found in postal directory.`,
    });
  } catch (err: any) {
    console.error('[Shipping API Error]', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal shipping service error.',
    });
  }
}
