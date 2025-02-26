/*
File: ENTERPRISE_SSO.md
Path: config/entra-id/ENTERPRISE_SSO.md
Purpose: Guide for business customers on setting up enterprise SSO
Last change: Initial creation of enterprise SSO guide
*/

# Enterprise SSO Integration Guide for Business Customers

This guide explains how business customers can enable Single Sign-On (SSO) for their entire organization with our application using Microsoft Entra ID (Azure AD).

## Benefits of Enterprise SSO

1. **Simplified Access**: Employees can use their existing organizational credentials
2. **Enhanced Security**: Leverage your existing security policies, MFA, and conditional access
3. **Centralized Management**: User access can be managed from your Entra ID admin portal
4. **Seamless Experience**: No need for separate usernames/passwords for each application

## Prerequisites

1. Microsoft Entra ID (Azure AD) tenant
2. Admin privileges in your organization's Entra ID
3. List of domains associated with your organization

## Step 1: Request SSO Integration

Contact our support team at support@example.com with the following information:
- Your organization name
- Primary domain (e.g., company.com)
- Technical contact person's name and email
- Approximate number of users who will access the application

## Step 2: Register Our Application in Your Azure Portal

Once we approve your request, you'll need to register our application in your Azure portal:

1. Sign in to the [Azure Portal](https://portal.azure.com/) as an administrator
2. Navigate to "Microsoft Entra ID" → "Enterprise applications" → "New application"
3. Search for "[Your Application Name]" in the gallery or select "Create your own application"
4. Choose "Integrate any other application you don't find in the gallery"
5. Enter a name for the application (e.g., "Our SSO Service")
6. Click "Create"

## Step 3: Configure Single Sign-On

1. In the newly created application, go to "Single sign-on" in the left sidebar
2. Select "SAML" or "OpenID Connect" as the method (we'll tell you which one to use)
3. Configure the following settings:

   For SAML:
   - Identifier (Entity ID): `[We will provide]`
   - Reply URL (Assertion Consumer Service URL): `[We will provide]`
   - Sign on URL: `[We will provide]`
   - Relay State: Leave empty
   
   For OpenID Connect:
   - Client ID: `[We will provide]`
   - Reply URLs: `[We will provide]`

4. Under User Attributes & Claims, ensure the following claims are included:
   - Email address
   - First name
   - Last name
   - User ID/Object ID
   - Groups (if applicable)

## Step 4: Assign Users and Groups

1. In your application, go to "Users and groups" in the left sidebar
2. Click "Add user/group"
3. Select the users or groups that should have access to our application
4. Click "Assign"

## Step 5: Testing the Integration

1. In a private/incognito browser window, navigate to our application: `[Application URL]`
2. Click "Sign in with your organization"
3. Enter your work email address
4. You should be redirected to your organization's Microsoft login page
5. After successful authentication, you'll be redirected back to our application

## Step 6: Go Live

After successful testing, notify our support team. We will then enable your domain for production access.

## Managing Access

- To grant access to additional users, add them through "Users and groups" in your Azure portal
- To revoke access, remove the user from the application in your Azure portal

## Troubleshooting

If users encounter issues signing in:

1. Verify the user is properly assigned to the application in Azure
2. Check if the user needs to perform additional authentication steps (MFA)
3. Ensure the user is using their correct organizational email address
4. Contact your IT department or our support team for assistance

## Support

For any issues or questions regarding the enterprise SSO setup, please contact:
- Email: enterprise-support@example.com
- Phone: +1-555-123-4567 