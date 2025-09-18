export interface SecurityChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'not-applicable';
  priority: 'low' | 'medium' | 'high' | 'critical';
  implementationGuide: string;
  verificationMethod: string;
}

export const SECURITY_CHECKLIST: SecurityChecklistItem[] = [
  // Authentication & Authorization
  {
    id: 'auth-001',
    category: 'Authentication',
    title: 'Multi-Factor Authentication',
    description: 'Implement multi-factor authentication for admin users',
    status: 'pending',
    priority: 'high',
    implementationGuide: 'Integrate TOTP or SMS-based 2FA for admin accounts',
    verificationMethod: 'Test login flow with 2FA enabled'
  },
  {
    id: 'auth-002',
    category: 'Authentication',
    title: 'Session Management',
    description: 'Implement secure session management with proper timeouts',
    status: 'completed',
    priority: 'high',
    implementationGuide: 'Use secure cookies with HttpOnly, SameSite, and Secure flags',
    verificationMethod: 'Check cookie attributes and session timeout behavior'
  },
  {
    id: 'auth-003',
    category: 'Authentication',
    title: 'Password Policy',
    description: 'Enforce strong password policies',
    status: 'completed',
    priority: 'high',
    implementationGuide: 'Implement minimum length, complexity requirements, and regular rotation',
    verificationMethod: 'Test password validation during registration and change'
  },

  // Data Protection
  {
    id: 'data-001',
    category: 'Data Protection',
    title: 'Data Encryption',
    description: 'Encrypt sensitive data at rest',
    status: 'in-progress',
    priority: 'critical',
    implementationGuide: 'Implement AES-256 encryption for PII and financial data',
    verificationMethod: 'Verify encrypted data cannot be read without decryption key'
  },
  {
    id: 'data-002',
    category: 'Data Protection',
    title: 'Data Masking',
    description: 'Mask sensitive data in logs and displays',
    status: 'pending',
    priority: 'medium',
    implementationGuide: 'Implement data masking for credit card numbers, SSN, etc.',
    verificationMethod: 'Check logs and UI for masked sensitive data'
  },
  {
    id: 'data-003',
    category: 'Data Protection',
    title: 'Data Backup',
    description: 'Implement regular encrypted backups',
    status: 'pending',
    priority: 'high',
    implementationGuide: 'Set up automated encrypted backups with secure storage',
    verificationMethod: 'Test backup restoration process'
  },

  // Input Validation
  {
    id: 'input-001',
    category: 'Input Validation',
    title: 'SQL Injection Protection',
    description: 'Prevent SQL injection attacks',
    status: 'completed',
    priority: 'critical',
    implementationGuide: 'Use parameterized queries and ORM features',
    verificationMethod: 'Test with SQL injection payloads'
  },
  {
    id: 'input-002',
    category: 'Input Validation',
    title: 'XSS Prevention',
    description: 'Prevent cross-site scripting attacks',
    status: 'completed',
    priority: 'critical',
    implementationGuide: 'Sanitize user input and use proper output encoding',
    verificationMethod: 'Test with XSS payloads'
  },
  {
    id: 'input-003',
    category: 'Input Validation',
    title: 'CSRF Protection',
    description: 'Prevent cross-site request forgery',
    status: 'completed',
    priority: 'high',
    implementationGuide: 'Implement anti-CSRF tokens for state-changing operations',
    verificationMethod: 'Verify CSRF tokens are validated on POST requests'
  },

  // API Security
  {
    id: 'api-001',
    category: 'API Security',
    title: 'Rate Limiting',
    description: 'Implement rate limiting for API endpoints',
    status: 'completed',
    priority: 'high',
    implementationGuide: 'Apply rate limits per IP and per user for sensitive endpoints',
    verificationMethod: 'Test API behavior under high request volume'
  },
  {
    id: 'api-002',
    category: 'API Security',
    title: 'API Authentication',
    description: 'Secure API endpoints with proper authentication',
    status: 'completed',
    priority: 'critical',
    implementationGuide: 'Use JWT tokens or API keys for API authentication',
    verificationMethod: 'Verify unauthorized access is denied to protected endpoints'
  },
  {
    id: 'api-003',
    category: 'API Security',
    title: 'Input Validation',
    description: 'Validate all API inputs',
    status: 'completed',
    priority: 'critical',
    implementationGuide: 'Implement strict input validation for all API parameters',
    verificationMethod: 'Test API with invalid/malformed inputs'
  },

  // Network Security
  {
    id: 'network-001',
    category: 'Network Security',
    title: 'HTTPS Enforcement',
    description: 'Enforce HTTPS for all connections',
    status: 'completed',
    priority: 'critical',
    implementationGuide: 'Configure SSL/TLS certificates and redirect HTTP to HTTPS',
    verificationMethod: 'Verify all pages load over HTTPS and HTTP redirects'
  },
  {
    id: 'network-002',
    category: 'Network Security',
    title: 'Security Headers',
    description: 'Implement security headers',
    status: 'completed',
    priority: 'high',
    implementationGuide: 'Add CSP, HSTS, X-Frame-Options, X-Content-Type-Options headers',
    verificationMethod: 'Check response headers for security directives'
  },
  {
    id: 'network-003',
    category: 'Network Security',
    title: 'CORS Configuration',
    description: 'Configure CORS properly',
    status: 'completed',
    priority: 'medium',
    implementationGuide: 'Restrict CORS to trusted origins only',
    verificationMethod: 'Test cross-origin requests from unauthorized domains'
  },

  // Application Security
  {
    id: 'app-001',
    category: 'Application Security',
    title: 'Dependency Security',
    description: 'Regularly update and scan dependencies',
    status: 'pending',
    priority: 'high',
    implementationGuide: 'Implement automated dependency scanning and update processes',
    verificationMethod: 'Run security scans on dependencies'
  },
  {
    id: 'app-002',
    category: 'Application Security',
    title: 'Error Handling',
    description: 'Implement secure error handling',
    status: 'completed',
    priority: 'medium',
    implementationGuide: 'Prevent information leakage through error messages',
    verificationMethod: 'Test error responses for sensitive information'
  },
  {
    id: 'app-003',
    category: 'Application Security',
    title: 'Logging & Monitoring',
    description: 'Implement comprehensive security logging',
    status: 'completed',
    priority: 'high',
    implementationGuide: 'Log security events and implement monitoring alerts',
    verificationMethod: 'Verify security events are logged appropriately'
  },

  // Payment Security
  {
    id: 'payment-001',
    category: 'Payment Security',
    title: 'PCI DSS Compliance',
    description: 'Ensure PCI DSS compliance for payment processing',
    status: 'pending',
    priority: 'critical',
    implementationGuide: 'Follow PCI DSS requirements for cardholder data protection',
    verificationMethod: 'Conduct PCI DSS compliance assessment'
  },
  {
    id: 'payment-002',
    category: 'Payment Security',
    title: 'Payment Tokenization',
    description: 'Implement payment tokenization',
    status: 'pending',
    priority: 'high',
    implementationGuide: 'Use tokenization to protect cardholder data',
    verificationMethod: 'Verify card data is not stored in plain text'
  },

  // Access Control
  {
    id: 'access-001',
    category: 'Access Control',
    title: 'Role-Based Access Control',
    description: 'Implement role-based access control',
    status: 'completed',
    priority: 'high',
    implementationGuide: 'Define roles and permissions for different user types',
    verificationMethod: 'Test access to resources based on user roles'
  },
  {
    id: 'access-002',
    category: 'Access Control',
    title: 'Principle of Least Privilege',
    description: 'Apply principle of least privilege',
    status: 'pending',
    priority: 'medium',
    implementationGuide: 'Ensure users have minimum required permissions',
    verificationMethod: 'Review user permissions and access levels'
  }
];

export class SecurityChecklistManager {
  private checklist: SecurityChecklistItem[];

  constructor() {
    this.checklist = [...SECURITY_CHECKLIST];
  }

  getChecklist(): SecurityChecklistItem[] {
    return this.checklist;
  }

  getChecklistByCategory(category: string): SecurityChecklistItem[] {
    return this.checklist.filter(item => item.category === category);
  }

  getChecklistByPriority(priority: string): SecurityChecklistItem[] {
    return this.checklist.filter(item => item.priority === priority);
  }

  getChecklistByStatus(status: string): SecurityChecklistItem[] {
    return this.checklist.filter(item => item.status === status);
  }

  updateItemStatus(id: string, status: SecurityChecklistItem['status']): void {
    const item = this.checklist.find(item => item.id === id);
    if (item) {
      item.status = status;
    }
  }

  getProgress(): { total: number; completed: number; percentage: number } {
    const total = this.checklist.length;
    const completed = this.checklist.filter(item => item.status === 'completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percentage };
  }

  getPriorityStats(): Record<string, number> {
    const stats: Record<string, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    this.checklist.forEach(item => {
      if (item.status !== 'completed') {
        stats[item.priority]++;
      }
    });

    return stats;
  }
}

export default SecurityChecklistManager;