import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { getSessionOrRedirect } from './withServerAuth';

/**
 * Higher-order function to protect admin routes.
 * Usage: export const getServerSideProps = withAdminAuth(async (ctx) => { ... });
 */
export function withAdminAuth(getServerSidePropsFunc?: (ctx: GetServerSidePropsContext) => Promise<GetServerSidePropsResult<any>>) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<any>> => {
    try {
      // First check authentication and admin role
      const authResult = await getSessionOrRedirect(ctx, { requireAdmin: true });
      
      // If redirect is needed, return it immediately
      if ('redirect' in authResult) {
        return authResult;
      }
      
      // If we have a session and the user is admin, proceed
      const { session } = authResult;
      
      // If there's a custom getServerSideProps function, call it
      if (getServerSidePropsFunc) {
        return await getServerSidePropsFunc(ctx);
      }
      
      // Default return props
      return { props: {} };
    } catch (error) {
      console.error('Error in withAdminAuth:', error);
      return { redirect: { destination: '/admin/login', permanent: false } };
    }
  };
}