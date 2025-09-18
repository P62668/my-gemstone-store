import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { logSecurityEvent } from './security';

const prisma = new PrismaClient();

export interface SecurityAuditResult {
  score: number;
  issues: SecurityIssue[];
  recommendations: string[];
}

export interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
}

export class SecurityAuditor {
  async performAudit(): Promise<SecurityAuditResult> {
    const issues: SecurityIssue[] = [];
    const recommendations: string[] = [];

    // Check for weak passwords
    await this.checkWeakPasswords(issues);

    // Check for inactive users with admin roles
    await this.checkInactiveAdmins(issues);

    // Check for excessive permissions
    await this.checkExcessivePermissions(issues);

    // Check for unsecured API endpoints
    await this.checkUnsecuredEndpoints(issues);

    // Check for outdated dependencies
    await this.checkOutdatedDependencies(issues);

    // Generate recommendations based on issues found
    this.generateRecommendations(issues, recommendations);

    // Calculate security score (0-100)
    const score = this.calculateScore(issues);

    return {
      score,
      issues,
      recommendations
    };
  }

  private async checkWeakPasswords(issues: SecurityIssue[]) {
    try {
      // In a real implementation, you would check password hashes against known weak password lists
      // For now, we'll just add a general recommendation
      issues.push({
        severity: 'medium',
        title: 'Password Security',
        description: 'Ensure all users have strong passwords that meet security requirements',
        recommendation: 'Implement password strength validation and regular password rotation policies'
      });
    } catch (error) {
      logger.error('Failed to check weak passwords', error);
    }
  }

  private async checkInactiveAdmins(issues: SecurityIssue[]) {
    try {
      const inactiveAdmins = await prisma.user.count({
        where: {
          role: 'admin',
          active: false
        }
      });

      if (inactiveAdmins > 0) {
        issues.push({
          severity: 'high',
          title: 'Inactive Admin Accounts',
          description: `Found ${inactiveAdmins} inactive admin accounts that should be removed or reactivated`,
          recommendation: 'Review and either reactivate or remove inactive admin accounts'
        });
      }
    } catch (error) {
      logger.error('Failed to check inactive admins', error);
    }
  }

  private async checkExcessivePermissions(issues: SecurityIssue[]) {
    try {
      // Check for users with admin roles who may not need them
      const adminUsers = await prisma.user.count({
        where: {
          role: 'admin'
        }
      });

      if (adminUsers > 5) {
        issues.push({
          severity: 'medium',
          title: 'Excessive Admin Permissions',
          description: `Found ${adminUsers} admin users. Consider if all need full admin access.`,
          recommendation: 'Review admin user roles and implement principle of least privilege'
        });
      }
    } catch (error) {
      logger.error('Failed to check excessive permissions', error);
    }
  }

  private async checkUnsecuredEndpoints(issues: SecurityIssue[]) {
    try {
      // In a real implementation, you would scan API endpoints for missing authentication
      // For now, we'll add a general recommendation
      issues.push({
        severity: 'high',
        title: 'API Endpoint Security',
        description: 'Ensure all API endpoints have proper authentication and authorization checks',
        recommendation: 'Review all API endpoints and implement proper security middleware'
      });
    } catch (error) {
      logger.error('Failed to check unsecured endpoints', error);
    }
  }

  private async checkOutdatedDependencies(issues: SecurityIssue[]) {
    try {
      // In a real implementation, you would check package.json for outdated dependencies
      // For now, we'll add a general recommendation
      issues.push({
        severity: 'medium',
        title: 'Dependency Security',
        description: 'Regularly update dependencies to address known security vulnerabilities',
        recommendation: 'Implement automated dependency scanning and update processes'
      });
    } catch (error) {
      logger.error('Failed to check outdated dependencies', error);
    }
  }

  private generateRecommendations(issues: SecurityIssue[], recommendations: string[]) {
    // Group issues by severity and generate recommendations
    const criticalIssues = issues.filter(issue => issue.severity === 'critical');
    const highIssues = issues.filter(issue => issue.severity === 'high');
    const mediumIssues = issues.filter(issue => issue.severity === 'medium');
    const lowIssues = issues.filter(issue => issue.severity === 'low');

    if (criticalIssues.length > 0) {
      recommendations.push('Address critical security issues immediately');
    }

    if (highIssues.length > 0) {
      recommendations.push('Prioritize high severity security issues in the next sprint');
    }

    if (mediumIssues.length > 0) {
      recommendations.push('Plan to address medium severity issues in upcoming releases');
    }

    if (lowIssues.length > 0) {
      recommendations.push('Consider addressing low severity issues during regular maintenance');
    }

    // General security recommendations
    recommendations.push('Implement regular security audits');
    recommendations.push('Enable two-factor authentication for admin users');
    recommendations.push('Set up security monitoring and alerting');
    recommendations.push('Regularly backup and test data recovery procedures');
  }

  private calculateScore(issues: SecurityIssue[]): number {
    // Calculate a security score based on issues found
    let score = 100;

    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    }

    // Ensure score doesn't go below 0
    return Math.max(0, score);
  }

  async logAuditResults(results: SecurityAuditResult) {
    await logSecurityEvent('Security Audit Completed', {
      score: results.score,
      issueCount: results.issues.length,
      criticalIssues: results.issues.filter(i => i.severity === 'critical').length,
      highIssues: results.issues.filter(i => i.severity === 'high').length,
      mediumIssues: results.issues.filter(i => i.severity === 'medium').length,
      lowIssues: results.issues.filter(i => i.severity === 'low').length
    });
  }
}

export default SecurityAuditor;