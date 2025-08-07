import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useCart } from '../components/context/CartContext';
import toast from 'react-hot-toast';

interface CheckoutForm {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  email: string;
}

interface Address {
  id: number;
  type: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
}

const CheckoutPage: React.FC = () => {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step] = useState(1); // 1: Shipping, 2: Billing, 3: Review
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState<CheckoutForm>({
    fullName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    email: '',
  });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | 'new'>('new');
  const [saveToAddressBook, setSaveToAddressBook] = useState(false);
  const [billingAddresses, setBillingAddresses] = useState<Address[]>([]);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<number | 'new'>('new');
  const [billingForm, setBillingForm] = useState<CheckoutForm>({
    fullName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    email: '',
  });
  const [saveBillingToAddressBook, setSaveBillingToAddressBook] = useState(false);
  const [useShippingForBilling, setUseShippingForBilling] = useState(true);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [billingFormErrors, setBillingFormErrors] = useState<{ [key: string]: string }>({});

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    if (router.query.success === '1') {
      setSuccess('Payment successful! Your order has been placed.');
      clearCart();
    }
    if (router.query.canceled === '1') {
      setError('Payment was canceled. Please try again.');
    }
  }, [router.query.success, router.query.canceled, clearCart]);

  useEffect(() => {
    // Fetch user addresses
    fetch('/api/addresses', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAddresses(data.filter((a) => a.type === 'shipping'));
          setBillingAddresses(data.filter((a) => a.type === 'billing'));
          // Pre-fill shipping
          const def =
            data.find((a) => a.type === 'shipping' && a.isDefault) ||
            data.find((a) => a.type === 'shipping');
          if (def) {
            setSelectedAddressId(def.id);
            setForm({
              fullName: def.name,
              address: def.address,
              city: def.city,
              state: def.state,
              postalCode: def.zipCode,
              phone: def.phone,
              email: '',
            });
          }
          // Pre-fill billing
          const defBill =
            data.find((a) => a.type === 'billing' && a.isDefault) ||
            data.find((a) => a.type === 'billing');
          if (defBill) {
            setSelectedBillingAddressId(defBill.id);
            setBillingForm({
              fullName: defBill.name,
              address: defBill.address,
              city: defBill.city,
              state: defBill.state,
              postalCode: defBill.zipCode,
              phone: defBill.phone,
              email: '',
            });
          }
        }
      });
  }, []);

  useEffect(() => {
    if (selectedAddressId === 'new') {
      setForm({
        fullName: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        phone: '',
        email: '',
      });
    } else if (selectedAddressId && addresses.length > 0) {
      const addr = addresses.find((a) => a.id === selectedAddressId);
      if (addr) {
        setForm({
          fullName: addr.name,
          address: addr.address,
          city: addr.city,
          state: addr.state,
          postalCode: addr.zipCode,
          phone: addr.phone,
          email: '',
        });
      }
    }
  }, [selectedAddressId, addresses]);

  useEffect(() => {
    if (useShippingForBilling) {
      setBillingForm(form);
    } else if (selectedBillingAddressId === 'new') {
      setBillingForm({
        fullName: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        phone: '',
        email: '',
      });
    } else if (selectedBillingAddressId && billingAddresses.length > 0) {
      const addr = billingAddresses.find((a) => a.id === selectedBillingAddressId);
      if (addr) {
        setBillingForm({
          fullName: addr.name,
          address: addr.address,
          city: addr.city,
          state: addr.state,
          postalCode: addr.zipCode,
          phone: addr.phone,
          email: '',
        });
      }
    }
  }, [selectedBillingAddressId, useShippingForBilling, form, billingAddresses]);

  // Real-time validation for shipping
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Validate on change
    if (name === 'postalCode' || name === 'phone') {
      setFormErrors((prev) => ({ ...prev, ...validateAddressFields({ ...form, [name]: value }) }));
    }
  };

  // Real-time validation for billing
  const handleBillingFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillingForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'postalCode' || name === 'phone') {
      setBillingFormErrors((prev) => ({
        ...prev,
        ...validateAddressFields({ ...billingForm, [name]: value }),
      }));
    }
  };

  function validateAddressFields(f: CheckoutForm) {
    const errors: { [key: string]: string } = {};
    if (!/^[1-9][0-9]{5}$/.test(f.postalCode)) {
      errors.postalCode = 'Enter a valid 6-digit postal code.';
    }
    if (!/^\d{10}$/.test(f.phone)) {
      errors.phone = 'Enter a valid 10-digit phone number.';
    }
    return errors;
  }

  // Multi-step: validate and show confirm modal
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    // Validate shipping
    const shippingErrors = validateAddressFields(form);
    setFormErrors(shippingErrors);
    if (Object.keys(shippingErrors).length > 0) {
      toast.error('Please correct errors in shipping address.');
      return;
    }
    // Validate billing if not using shipping
    if (!useShippingForBilling) {
      const billErrors = validateAddressFields(billingForm);
      setBillingFormErrors(billErrors);
      if (Object.keys(billErrors).length > 0) {
        toast.error('Please correct errors in billing address.');
        return;
      }
    } else {
      setBillingFormErrors({});
    }
    setShowConfirm(true);
  };

  // Final order placement
  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const orderItems = cart.map((item) => ({
        gemstoneId: Number(item.id),
        quantity: item.quantity,
        price: item.price,
      }));
      const orderTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items: orderItems,
          total: orderTotal,
          status: 'paid',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }
      if (data.emailWarning) {
        setSuccess('Order placed successfully! (Email not sent)');
        toast.success('Order placed, but confirmation email could not be sent.');
      } else {
        setSuccess('Order placed successfully! Thank you for your purchase.');
        toast.success('Order placed successfully!');
      }
      if (selectedAddressId === 'new' && saveToAddressBook) {
        await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            type: 'shipping',
            name: form.fullName,
            address: form.address,
            city: form.city,
            state: form.state,
            zipCode: form.postalCode,
            phone: form.phone,
            isDefault: false,
          }),
        });
      }
      if (
        !useShippingForBilling &&
        selectedBillingAddressId === 'new' &&
        saveBillingToAddressBook
      ) {
        await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            type: 'billing',
            name: billingForm.fullName,
            address: billingForm.address,
            city: billingForm.city,
            state: billingForm.state,
            zipCode: billingForm.postalCode,
            phone: billingForm.phone,
            isDefault: false,
          }),
        });
      }
      clearCart();
      setTimeout(() => {
        router.push('/orders');
      }, 2000);
    } catch (err) {
      const errorMsg =
        err instanceof Error && err.message
          ? err.message
          : 'Failed to place order. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  // SEO structured data (JSON-LD)
  const seoJsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'CheckoutPage',
    name: 'Checkout - Shankarmala Gemstore',
    description:
      'Secure checkout for certified gemstones at Shankarmala Gemstore. 100% authentic, luxury, and accessible.',
    url: 'https://shankarmala.com/checkout',
    order: cart.map((item, idx) => ({
      '@type': 'Product',
      position: idx + 1,
      name: item.name,
      images: item.images,
      sku: item.id,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: item.price,
        availability: 'https://schema.org/InStock',
      },
    })),
  };

  if (cart.length === 0) {
    return (
      <Layout title="Checkout - Kolkata Gems">
        <Head>
          <title>Checkout - Shankarmala Gemstore</title>
          <meta
            name="description"
            content="Secure checkout for certified gemstones at Shankarmala Gemstore. 100% authentic, luxury, and accessible."
          />
          <meta property="og:title" content="Checkout - Shankarmala Gemstore" />
          <meta
            property="og:description"
            content="Secure checkout for certified gemstones at Shankarmala Gemstore. 100% authentic, luxury, and accessible."
          />
          <meta property="og:image" content="/images/placeholder-gemstone.jpg" />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://shankarmala.com/checkout" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Checkout - Shankarmala Gemstore" />
          <meta
            name="twitter:description"
            content="Secure checkout for certified gemstones at Shankarmala Gemstore."
          />
          <meta name="twitter:image" content="/images/placeholder-gemstone.jpg" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(seoJsonLd) }}
          />
        </Head>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 text-lg mb-4">Your cart is empty.</div>
            <Link
              href="/shop"
              className="bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Checkout - Kolkata Gems">
      <Head>
        <title>Checkout - Shankarmala Gemstore</title>
        <meta
          name="description"
          content="Secure checkout for certified gemstones at Shankarmala Gemstore. 100% authentic, luxury, and accessible."
        />
        <meta property="og:title" content="Checkout - Shankarmala Gemstore" />
        <meta
          property="og:description"
          content="Secure checkout for certified gemstones at Shankarmala Gemstore. 100% authentic, luxury, and accessible."
        />
        <meta
          property="og:image"
          content={cart[0]?.images?.[0] || '/images/placeholder-gemstone.jpg'}
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shankarmala.com/checkout" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Checkout - Shankarmala Gemstore" />
        <meta
          name="twitter:description"
          content="Secure checkout for certified gemstones at Shankarmala Gemstore."
        />
        <meta
          name="twitter:image"
          content={cart[0]?.images?.[0] || '/images/placeholder-gemstone.jpg'}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(seoJsonLd) }}
        />
      </Head>
      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-amber-900 mb-10 text-center font-serif">
          Checkout
        </h1>
        {/* Step Progress Indicator */}
        <ol
          className="flex justify-center mb-8 gap-4 text-sm font-medium"
          aria-label="Checkout steps"
        >
          <li
            className={`flex items-center gap-2 ${step === 1 ? 'text-amber-700' : 'text-gray-400'}`}
          >
            1. Shipping
          </li>
          <li className="text-gray-400">→</li>
          <li
            className={`flex items-center gap-2 ${step === 2 ? 'text-amber-700' : 'text-gray-400'}`}
          >
            2. Billing
          </li>
          <li className="text-gray-400">→</li>
          <li
            className={`flex items-center gap-2 ${step === 3 ? 'text-amber-700' : 'text-gray-400'}`}
          >
            3. Review
          </li>
        </ol>

        {success && (
          <div
            className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6"
            aria-live="polite"
            role="status"
          >
            <div className="text-green-800">{success}</div>
          </div>
        )}

        {error && (
          <div
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
            aria-live="polite"
            role="alert"
          >
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div
            className="fixed inset-0 bg-white/70 z-50 flex items-center justify-center"
            role="alert"
            aria-busy="true"
          >
            <div className="flex flex-col items-center gap-4">
              <svg
                className="animate-spin h-10 w-10 text-amber-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <span className="text-amber-700 font-semibold">Processing your order...</span>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-amber-100">
              <h2 className="text-xl font-bold text-amber-900 mb-4 font-serif">
                Confirm Your Order
              </h2>
              <div className="mb-4">
                <div className="font-semibold text-amber-700 mb-1">Shipping Address</div>
                <div className="text-gray-700 text-sm">
                  {form.fullName}, {form.address}, {form.city}, {form.state}, {form.postalCode},{' '}
                  {form.phone}
                </div>
              </div>
              <div className="mb-4">
                <div className="font-semibold text-amber-700 mb-1">Billing Address</div>
                <div className="text-gray-700 text-sm">
                  {useShippingForBilling
                    ? `${form.fullName}, ${form.address}, ${form.city}, ${form.state}, ${form.postalCode}, ${form.phone}`
                    : `${billingForm.fullName}, ${billingForm.address}, ${billingForm.city}, ${billingForm.state}, ${billingForm.postalCode}, ${billingForm.phone}`}
                </div>
              </div>
              <div className="mb-4">
                <div className="font-semibold text-amber-700 mb-1">Order Total</div>
                <div className="text-amber-900 font-bold text-lg">
                  ₹{total.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-amber-700 transition"
                >
                  Confirm & Place Order
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Shipping & Payment Form */}
          <form
            ref={formRef}
            className="bg-white/90 rounded-3xl shadow-2xl border border-amber-100 p-8 flex flex-col gap-8"
            onSubmit={handleSubmit}
            aria-labelledby="checkout-form-legend"
            role="form"
            tabIndex={-1}
          >
            <legend id="checkout-form-legend" className="sr-only">
              Checkout Form: Shipping, Billing, and Payment Details
            </legend>
            <div className="mb-4 pb-4 border-b border-amber-100">
              <h2
                className="text-2xl font-semibold text-amber-900 mb-2 font-serif tracking-tight"
                id="shipping-heading"
              >
                Shipping Details
              </h2>
              {addresses.length > 0 && (
                <div className="mb-2">
                  <label
                    htmlFor="shipping-address-select"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Select Saved Address
                  </label>
                  <select
                    id="shipping-address-select"
                    className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 w-full"
                    value={selectedAddressId}
                    onChange={(e) =>
                      setSelectedAddressId(
                        e.target.value === 'new' ? 'new' : Number(e.target.value),
                      )
                    }
                    aria-label="Select saved shipping address"
                  >
                    {addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.name} ({addr.address}, {addr.city})
                        {addr.isDefault ? ' [Default]' : ''}
                      </option>
                    ))}
                    <option value="new">+ Add New Address</option>
                  </select>
                </div>
              )}
              <label htmlFor="fullName" className="sr-only">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleFormChange}
                placeholder="Full Name"
                required
                className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500"
                aria-required="true"
                aria-label="Full Name"
              />
              <label htmlFor="address" className="sr-only">
                Address
              </label>
              <input
                id="address"
                type="text"
                name="address"
                value={form.address}
                onChange={handleFormChange}
                placeholder="Address"
                required
                className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500"
                aria-required="true"
                aria-label="Address"
              />
              <label htmlFor="city" className="sr-only">
                City
              </label>
              <input
                id="city"
                type="text"
                name="city"
                value={form.city}
                onChange={handleFormChange}
                placeholder="City"
                required
                className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500"
                aria-required="true"
                aria-label="City"
              />
              <label htmlFor="state" className="sr-only">
                State
              </label>
              <input
                id="state"
                type="text"
                name="state"
                value={form.state}
                onChange={handleFormChange}
                placeholder="State"
                required
                className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500"
                aria-required="true"
                aria-label="State"
              />
              <label htmlFor="postalCode" className="sr-only">
                Postal Code
              </label>
              <input
                id="postalCode"
                type="text"
                name="postalCode"
                value={form.postalCode}
                onChange={handleFormChange}
                placeholder="Postal Code"
                required
                className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500"
                aria-required="true"
                aria-label="Postal Code"
                aria-invalid={!!formErrors.postalCode}
                aria-describedby={formErrors.postalCode ? 'shipping-postal-error' : undefined}
              />
              {formErrors.postalCode && (
                <div id="shipping-postal-error" className="text-red-600 text-xs mb-2" role="alert">
                  {formErrors.postalCode}
                </div>
              )}
              <label htmlFor="phone" className="sr-only">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleFormChange}
                placeholder="Phone Number"
                required
                className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500"
                aria-required="true"
                aria-label="Phone Number"
                aria-invalid={!!formErrors.phone}
                aria-describedby={formErrors.phone ? 'shipping-phone-error' : undefined}
              />
              {formErrors.phone && (
                <div id="shipping-phone-error" className="text-red-600 text-xs mb-2" role="alert">
                  {formErrors.phone}
                </div>
              )}
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleFormChange}
                placeholder="Email"
                required
                className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500"
                aria-required="true"
                aria-label="Email"
              />
              {selectedAddressId === 'new' && (
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="saveToAddressBook"
                    checked={saveToAddressBook}
                    onChange={(e) => setSaveToAddressBook(e.target.checked)}
                    className="rounded border-amber-200 text-amber-600 focus:ring-amber-500 mr-2"
                    aria-checked={saveToAddressBook}
                  />
                  <label htmlFor="saveToAddressBook" className="text-sm text-gray-700">
                    Save this address to my address book
                  </label>
                </div>
              )}
            </div>

            <div className="mb-4 pb-4 border-b border-amber-100">
              <h2
                className="text-2xl font-semibold text-amber-900 mb-2 font-serif tracking-tight"
                id="billing-heading"
              >
                Billing Address
              </h2>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="useShippingForBilling"
                  checked={useShippingForBilling}
                  onChange={(e) => setUseShippingForBilling(e.target.checked)}
                  className="rounded border-amber-200 text-amber-600 focus:ring-amber-500 mr-2"
                  aria-checked={useShippingForBilling}
                />
                <label htmlFor="useShippingForBilling" className="text-sm text-gray-700">
                  Use shipping address as billing address
                </label>
              </div>
              {!useShippingForBilling && (
                <>
                  {billingAddresses.length > 0 && (
                    <div className="mb-2">
                      <label
                        htmlFor="billing-address-select"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Select Saved Billing Address
                      </label>
                      <select
                        id="billing-address-select"
                        className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500 w-full"
                        value={selectedBillingAddressId}
                        onChange={(e) =>
                          setSelectedBillingAddressId(
                            e.target.value === 'new' ? 'new' : Number(e.target.value),
                          )
                        }
                        aria-label="Select saved billing address"
                      >
                        {billingAddresses.map((addr) => (
                          <option key={addr.id} value={addr.id}>
                            {addr.name} ({addr.address}, {addr.city})
                            {addr.isDefault ? ' [Default]' : ''}
                          </option>
                        ))}
                        <option value="new">+ Add New Billing Address</option>
                      </select>
                    </div>
                  )}
                  <label htmlFor="billingFullName" className="sr-only">
                    Full Name
                  </label>
                  <input
                    id="billingFullName"
                    type="text"
                    name="fullName"
                    value={billingForm.fullName}
                    onChange={handleBillingFormChange}
                    placeholder="Full Name"
                    required
                    className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500"
                    aria-required="true"
                    aria-label="Full Name"
                  />
                  <label htmlFor="billingAddress" className="sr-only">
                    Address
                  </label>
                  <input
                    id="billingAddress"
                    type="text"
                    name="address"
                    value={billingForm.address}
                    onChange={handleBillingFormChange}
                    placeholder="Address"
                    required
                    className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500"
                    aria-required="true"
                    aria-label="Address"
                  />
                  <label htmlFor="billingCity" className="sr-only">
                    City
                  </label>
                  <input
                    id="billingCity"
                    type="text"
                    name="city"
                    value={billingForm.city}
                    onChange={handleBillingFormChange}
                    placeholder="City"
                    required
                    className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500"
                    aria-required="true"
                    aria-label="City"
                  />
                  <label htmlFor="billingState" className="sr-only">
                    State
                  </label>
                  <input
                    id="billingState"
                    type="text"
                    name="state"
                    value={billingForm.state}
                    onChange={handleBillingFormChange}
                    placeholder="State"
                    required
                    className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500"
                    aria-required="true"
                    aria-label="State"
                  />
                  <label htmlFor="billingPostalCode" className="sr-only">
                    Postal Code
                  </label>
                  <input
                    id="billingPostalCode"
                    type="text"
                    name="postalCode"
                    value={billingForm.postalCode}
                    onChange={handleBillingFormChange}
                    placeholder="Postal Code"
                    required
                    className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500"
                    aria-required="true"
                    aria-label="Postal Code"
                    aria-invalid={!!billingFormErrors.postalCode}
                    aria-describedby={
                      billingFormErrors.postalCode ? 'billing-postal-error' : undefined
                    }
                  />
                  {billingFormErrors.postalCode && (
                    <div
                      id="billing-postal-error"
                      className="text-red-600 text-xs mb-2"
                      role="alert"
                    >
                      {billingFormErrors.postalCode}
                    </div>
                  )}
                  <label htmlFor="billingPhone" className="sr-only">
                    Phone Number
                  </label>
                  <input
                    id="billingPhone"
                    type="tel"
                    name="phone"
                    value={billingForm.phone}
                    onChange={handleBillingFormChange}
                    placeholder="Phone Number"
                    required
                    className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500"
                    aria-required="true"
                    aria-label="Phone Number"
                    aria-invalid={!!billingFormErrors.phone}
                    aria-describedby={billingFormErrors.phone ? 'billing-phone-error' : undefined}
                  />
                  {billingFormErrors.phone && (
                    <div
                      id="billing-phone-error"
                      className="text-red-600 text-xs mb-2"
                      role="alert"
                    >
                      {billingFormErrors.phone}
                    </div>
                  )}
                  <label htmlFor="billingEmail" className="sr-only">
                    Email
                  </label>
                  <input
                    id="billingEmail"
                    type="email"
                    name="email"
                    value={billingForm.email}
                    onChange={handleBillingFormChange}
                    placeholder="Email"
                    required
                    className="rounded-xl border border-amber-200 px-4 py-3 focus:ring-amber-500"
                    aria-required="true"
                    aria-label="Email"
                  />
                  {selectedBillingAddressId === 'new' && (
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="saveBillingToAddressBook"
                        checked={saveBillingToAddressBook}
                        onChange={(e) => setSaveBillingToAddressBook(e.target.checked)}
                        className="rounded border-amber-200 text-amber-600 focus:ring-amber-500 mr-2"
                        aria-checked={saveBillingToAddressBook}
                      />
                      <label htmlFor="saveBillingToAddressBook" className="text-sm text-gray-700">
                        Save this billing address to my address book
                      </label>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mb-4 pb-4 border-b border-amber-100">
              <h2 className="text-2xl font-semibold text-amber-900 mb-2 font-serif tracking-tight">
                Payment
              </h2>
              <div className="bg-amber-50 rounded-xl p-4 mb-4 border border-amber-100 flex flex-col gap-2">
                <p className="text-amber-800 text-sm font-medium">
                  For demo purposes, this checkout simulates a successful order. In production, this
                  would integrate with a secure payment processor.
                </p>
                <div className="flex items-center gap-3 mt-2" aria-label="Accepted payment methods">
                  <Image
                    src={
                      typeof '/images/payment-visa.svg' === 'string' &&
                      '/images/payment-visa.svg'.startsWith('/')
                        ? '/images/payment-visa.svg'
                        : '/images/placeholder-gemstone.jpg'
                    }
                    alt="Visa"
                    width={40}
                    height={24}
                    className="h-6 w-auto"
                    style={{ width: 'auto', height: '24px' }}
                  />
                  <Image
                    src={
                      typeof '/images/payment-mastercard.svg' === 'string' &&
                      '/images/payment-mastercard.svg'.startsWith('/')
                        ? '/images/payment-mastercard.svg'
                        : '/images/placeholder-gemstone.jpg'
                    }
                    alt="Mastercard"
                    width={40}
                    height={24}
                    className="h-6 w-auto"
                    style={{ width: 'auto', height: '24px' }}
                  />
                  <Image
                    src={
                      typeof '/images/payment-amex.svg' === 'string' &&
                      '/images/payment-amex.svg'.startsWith('/')
                        ? '/images/payment-amex.svg'
                        : '/images/placeholder-gemstone.jpg'
                    }
                    alt="American Express"
                    width={40}
                    height={24}
                    className="h-6 w-auto"
                    style={{ width: 'auto', height: '24px' }}
                  />
                  <Image
                    src={
                      typeof '/images/payment-upi.svg' === 'string' &&
                      '/images/payment-upi.svg'.startsWith('/')
                        ? '/images/payment-upi.svg'
                        : '/images/placeholder-gemstone.jpg'
                    }
                    alt="UPI"
                    width={40}
                    height={24}
                    className="h-6 w-auto"
                    style={{ width: 'auto', height: '24px' }}
                  />
                  <Image
                    src={
                      typeof '/images/payment-ruPay.svg' === 'string' &&
                      '/images/payment-ruPay.svg'.startsWith('/')
                        ? '/images/payment-ruPay.svg'
                        : '/images/placeholder-gemstone.jpg'
                    }
                    alt="RuPay"
                    width={40}
                    height={24}
                    className="h-6 w-auto"
                    style={{ width: 'auto', height: '24px' }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-2" aria-live="polite">
                  <span className="inline-flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-green-600 inline"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    100% Secure SSL Checkout
                  </span>
                  <span className="ml-4 inline-flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-blue-600 inline"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
                    </svg>
                    Fast Delivery
                  </span>
                  <span className="ml-4 inline-flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-amber-600 inline"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
                    </svg>
                    GIA/IGI Certified
                  </span>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 bg-amber-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-amber-700 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed font-serif tracking-wide"
              disabled={loading}
              aria-busy={loading}
              aria-label="Place Order"
            >
              {loading ? 'Processing Order...' : 'Place Order'}
            </button>
            <div className="text-xs text-gray-500 mt-2 text-center" aria-live="polite">
              <span className="inline-flex items-center gap-1">
                <svg
                  className="w-4 h-4 text-green-600 inline"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                100% Secure. GIA/IGI Certified. Trusted by collectors worldwide.
              </span>
              <span className="block mt-1 text-amber-700 font-semibold">
                Your privacy is protected. We never share your data.
              </span>
            </div>
          </form>

          {/* Cart Summary */}
          <div className="bg-white/90 rounded-3xl shadow-2xl border border-amber-100 p-8 flex flex-col gap-6">
            <h2 className="text-2xl font-semibold text-amber-900 mb-4 font-serif tracking-tight">
              Order Summary
            </h2>
            <ul className="divide-y divide-amber-100 mb-6">
              {cart.map((item) => (
                <li key={item.id} className="flex items-center gap-4 py-4">
                  <Image
                    src={
                      typeof item.images?.[0] === 'string' &&
                      (item.images[0].startsWith('/') || item.images[0].startsWith('http')) &&
                      item.images[0].trim() !== ''
                        ? item.images[0]
                        : '/images/placeholder-gemstone.jpg'
                    }
                    alt={item.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-xl object-cover border border-amber-200 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-lg text-amber-900 truncate font-serif">
                      {item.name}
                    </div>
                    <div className="text-amber-700 font-bold">
                      ₹{item.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="text-gray-700 font-medium">x{item.quantity}</div>
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center mt-4 border-t border-amber-100 pt-4">
              <div className="text-xl font-bold text-amber-900 font-serif">Total</div>
              <div className="text-2xl font-bold text-amber-700 font-serif">
                ₹{total.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
