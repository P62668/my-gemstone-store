# Notification System Documentation

## Overview

The notification system provides real-time notifications and email automation for the Shankarmala Gemstore platform. It includes:

1. Real-time WebSocket notifications
2. Email automation with template management
3. Admin interface for managing notification templates
4. User notification center

## Architecture

### Components

1. **WebSocket Server** - Handles real-time communication
2. **Notification Service** - Core business logic
3. **Email Service** - Handles email sending
4. **Notification Templates** - Database-stored email templates
5. **Frontend Components** - UI for displaying notifications

### Data Flow

1. Event occurs (order placed, shipped, etc.)
2. Notification Service creates database record
3. WebSocket sends real-time notification to user
4. Email Service sends templated email
5. User receives notification in-app and via email

## Implementation Details

### WebSocket Implementation

The WebSocket server is implemented using Socket.IO and handles:

- User authentication
- Real-time notification delivery
- Connection management

### Notification Templates

Templates are stored in the database and can be managed through the admin interface. Available templates include:

- Order confirmation
- Order shipped
- Order delivered
- Order cancelled
- Password reset
- Welcome email

### Email Service

The email service supports:

- Template-based emails
- Custom styling
- Dynamic content replacement
- Multiple email providers via Nodemailer

## API Endpoints

### Admin Routes

- `GET /api/admin/notification-templates` - Get all templates
- `POST /api/admin/notification-templates` - Create/update template
- `DELETE /api/admin/notification-templates?id=:id` - Delete template

### User Routes

- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification
- `PATCH /api/notifications/:id` - Update notification
- `DELETE /api/notifications/:id` - Delete notification
- `POST /api/notifications/read-all` - Mark all as read

## Admin Interface

The admin interface allows management of notification templates through:

- Template listing with preview
- Create/edit forms
- Real-time template updates

## Frontend Components

### Notification Context

Provides global state management for notifications including:

- Notification list
- Unread count
- Loading states
- Error handling

### Notification Center

UI component that displays notifications in a dropdown with:

- Real-time updates
- Mark as read functionality
- Notification types (info, success, warning, error)
- Toast notifications for new alerts

## Real-time Features

### WebSocket Connection

1. Client connects to `/api/ws` endpoint
2. Authenticates with user ID
3. Receives real-time notifications
4. Handles reconnection on disconnect

### Notification Types

- **In-app notifications** - Displayed in notification center
- **Email notifications** - Sent via email service
- **Toast notifications** - Brief alerts for important events

## Email Automation

### Template System

Templates support:

- Dynamic placeholders ({{firstName}}, {{orderId}})
- HTML content
- Custom styling
- Subject customization

### Supported Events

- Order status changes
- Account actions (password reset, welcome)
- System notifications

## Security

### Authentication

- WebSocket authentication with user tokens
- API route protection with admin middleware
- User-specific notification access

### Data Protection

- Template content sanitization
- Secure email sending
- Rate limiting for notification endpoints

## Testing

### Unit Tests

- Notification service methods
- Email template rendering
- WebSocket connection handling

### Integration Tests

- End-to-end notification flow
- Template management
- Email sending verification

## Deployment

### Environment Variables

```env
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=true
EMAIL_USER=your@email.com
EMAIL_PASS=yourpassword
EMAIL_FROM="Shankarmala Gemstore" <no-reply@shankarmala.com>
```

### Scaling Considerations

- WebSocket connection limits
- Email sending rate limits
- Database performance for notification queries

## Maintenance

### Template Updates

1. Access admin notification templates page
2. Edit existing templates or create new ones
3. Changes take effect immediately

### Monitoring

- WebSocket connection logs
- Email sending success/failure rates
- Notification delivery metrics

## Troubleshooting

### Common Issues

1. **WebSocket connection failures** - Check server logs and network connectivity
2. **Email sending failures** - Verify email credentials and provider status
3. **Template rendering issues** - Check template syntax and placeholder usage

### Debugging Steps

1. Check server logs for error messages
2. Verify environment variables are set correctly
3. Test WebSocket connection with simple client
4. Validate email templates with sample data