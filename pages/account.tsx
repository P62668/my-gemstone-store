import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import { prisma } from '../lib/prisma';
import { Session } from 'next-auth';

interface OrderSummary {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  orderNumber?: string | null;
}

interface Props {
  user: { id: number; firstName?: string | null; email?: string | null } | null;
  orders: OrderSummary[];
}

const AccountPage: React.FC<Props> = ({ user, orders }) => {
  if (!user) {
    return (
      <Layout title="My Account - Shankarmala">
        <main className="max-w-4xl mx-auto py-12">
          <h1 className="text-2xl font-bold">Not signed in</h1>
          <p className="mt-4">Please <Link href="/login" className="text-amber-600 underline">sign in</Link> to access your account.</p>
        </main>
      </Layout>
    );
  }

  return (
    <Layout title="My Account - Shankarmala">
      <Head>
        <title>My Account - Shankarmala Gemstore</title>
      </Head>
      <main className="max-w-4xl mx-auto py-12 px-4">
        <section className="mb-8">
          <h1 className="text-3xl font-bold">Welcome, {user.firstName || user.email}</h1>
          <p className="text-sm text-gray-600 mt-2">Manage your orders, addresses and account settings.</p>
          <div className="mt-4 flex gap-2">
            <Link href="/shop" className="px-4 py-2 bg-amber-500 text-white rounded">Start Shopping</Link>
            <Link href="/wishlist" className="px-4 py-2 border rounded">My Wishlist</Link>
            <Link href="/orders" className="px-4 py-2 border rounded">All Orders</Link>
          </div>
        </section>

        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          {orders.length === 0 ? (
            <div className="text-gray-600">You have no orders yet.</div>
          ) : (
            <ul className="space-y-3">
              {orders.map((o) => (
                <li key={o.id} className="flex justify-between items-center border rounded p-3">
                  <div>
                    <div className="font-medium">Order #{o.id} {o.orderNumber ? `(${o.orderNumber})` : ''}</div>
                    <div className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₹{o.total.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">{o.status}</div>
                    <Link href={`/orders/${o.id}`} className="text-sm text-amber-600 underline">View</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </Layout>
  );
};

export default AccountPage;

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  try {
    const session = (await getServerSession(context.req as any, context.res as any, authOptions as any)) as Session | null;
    if (!session || !session.user) {
      return { redirect: { destination: '/login?redirect=/account', permanent: false } };
    }

    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : (session.user.id as number);

    // Defensive: ensure we have a valid numeric id
    if (!userId || Number.isNaN(Number(userId))) {
      return { redirect: { destination: '/login?redirect=/account', permanent: false } };
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { id: true, firstName: true, email: true },
    });

    const userOrders = await prisma.order.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, total: true, status: true, createdAt: true, orderNumber: true },
    });

    return {
      props: {
        user: dbUser ? JSON.parse(JSON.stringify(dbUser)) : null,
        orders: JSON.parse(JSON.stringify(userOrders || [])),
      },
    };
  } catch (error) {
    // Log server-side error and return a safe fallback so the page doesn't crash.
    console.error('[account] getServerSideProps error:', (error as Error).message || error);
    return {
      props: {
        user: null,
        orders: [],
      },
    };
  }
};
