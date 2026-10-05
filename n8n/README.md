# WhatsApp Business Automation Workflow (n8n + Meta Cloud API)
## Sri Raja Rajeshwara Handloom — Wholesale Cloth Merchant

This directory contains the production-ready, importable n8n workflow for automated WhatsApp Business messaging powered by the official **Meta WhatsApp Cloud API**.

---

## Quick Setup Guide

### 1. Open n8n
- Open your n8n workspace (cloud or self-hosted).

### 2. Import the Workflow
- In n8n, click **Workflows** → **Add workflow** (or menu icon `...`).
- Select **Import from File...**
- Choose `n8n/sri-raja-rajeshwara-whatsapp-automation.json`.

### 3. Configure Meta WhatsApp Credentials
Double-click the **Config & Credentials** node in n8n and set your Meta Cloud API values:
- `META_WHATSAPP_ACCESS_TOKEN`: Your Meta Permanent System User Access Token.
- `META_WHATSAPP_PHONE_NUMBER_ID`: Your WhatsApp Phone Number ID (from Meta Developer App Dashboard).
- `META_WHATSAPP_BUSINESS_ACCOUNT_ID`: Your WhatsApp Business Account ID (WABA ID).
- `ADMIN_WHATSAPP_NUMBER`: Business admin phone number in E.164 format without `+` (default: `919440472939`).

### 4. Configure Webhook Secret (Security)
In the same **Config & Credentials** node:
- `WEBHOOK_SECRET`: Set a secure random string (e.g. `srr_secret_key_...`).
- Copy the exact same secret to your website's `.env.local` as `N8N_WHATSAPP_WEBHOOK_SECRET`.
- When ready to strictly enforce HMAC verification, toggle `REQUIRE_HMAC_SIGNATURE` to `true`.

### 5. Configure Approved WhatsApp Template Names
Ensure the template names in the **Config & Credentials** node match your pre-approved templates in the Meta WhatsApp Manager:
- `TEMPLATE_ORDER_PLACED`: `order_placed_wholesale`
- `TEMPLATE_ORDER_CONFIRMED`: `order_confirmed_wholesale`
- `TEMPLATE_ORDER_PROCESSING`: `order_processing_wholesale`
- `TEMPLATE_ORDER_PACKED`: `order_packed_wholesale`
- `TEMPLATE_ORDER_SHIPPED`: `order_shipped_consignment`
- `TEMPLATE_ORDER_DELIVERED`: `order_delivered_wholesale`
- `TEMPLATE_ORDER_CANCELLED`: `order_cancelled_wholesale`
- `TEMPLATE_WHOLESALE_ENQUIRY`: `wholesale_enquiry_admin_alert`

### 6. Set the Production Webhook URL
- Double-click the **Website Webhook** node.
- Copy the **Production URL** (path: `/webhook/sr-handloom-whatsapp`).
- Add this URL to your website's `.env.local`:
  ```env
  N8N_WHATSAPP_WEBHOOK_URL=https://your-n8n-instance.com/webhook/sr-handloom-whatsapp
  N8N_WHATSAPP_WEBHOOK_SECRET=your_configured_webhook_secret
  ```

### 7. Test With a Sample Payload
Click **Test step** on the **Website Webhook** node or trigger it using `curl` / Postman with this sample payload:

```json
{
  "event_type": "ORDER_PLACED",
  "idempotency_key": "test-order-001:ORDER_PLACED",
  "order_id": "test-order-001",
  "order_number": "SRR-2026-TEST",
  "customer_name": "Ramesh Kumar",
  "customer_phone": "919440472939",
  "customer_type": "Retail Shop",
  "order_status": "Order Placed",
  "total_pieces": 120,
  "subtotal": 24000,
  "delivery_charge": 500,
  "total_amount": 24500,
  "payment_status": "Pending",
  "tracking_number": null,
  "lr_number": null,
  "transporter_name": null,
  "shipped_at": null,
  "delivered_at": null,
  "created_at": "2026-10-05T14:30:00.000Z"
}
```

Verify that the payload traverses:
`Website Webhook` → `Config & Credentials` → `Verify & Normalize` → `Is Authorized & Unique?` → `Route by event_type` → `Prepare ORDER_PLACED` → `Send Meta WhatsApp Message` → `Evaluate Meta API Result`.

### 8. Activate the Workflow
- Toggle the workflow switch in the top-right corner of n8n from **Inactive** to **Active**.
- Your wholesale automated notification system is now live!

---

## Meta Template Variable Reference

When registering templates in the [Meta WhatsApp Business Manager](https://business.facebook.com/wa/manage/message-templates/), configure these body variables:

| Template Name | Target Audience | Variables in Body |
| :--- | :--- | :--- |
| `order_placed_wholesale` | Customer | `{{1}}` Customer Name, `{{2}}` Order Number, `{{3}}` Total Pieces, `{{4}}` Total Amount, `{{5}}` Payment Status |
| `order_confirmed_wholesale` | Customer | `{{1}}` Customer Name, `{{2}}` Order Number, `{{3}}` Total Pieces, `{{4}}` Total Amount |
| `order_processing_wholesale` | Customer | `{{1}}` Customer Name, `{{2}}` Order Number, `{{3}}` Total Pieces |
| `order_packed_wholesale` | Customer | `{{1}}` Customer Name, `{{2}}` Order Number, `{{3}}` Total Pieces |
| `order_shipped_consignment` | Customer | `{{1}}` Customer Name, `{{2}}` Order Number, `{{3}}` Transporter Name, `{{4}}` LR Number, `{{5}}` Tracking / Consignment Details, `{{6}}` Shipped Date |
| `order_delivered_wholesale` | Customer | `{{1}}` Customer Name, `{{2}}` Order Number, `{{3}}` Delivery Date |
| `order_cancelled_wholesale` | Customer | `{{1}}` Customer Name, `{{2}}` Order Number |
| `wholesale_enquiry_admin_alert` | Admin Number | `{{1}}` Customer Name, `{{2}}` Business Name, `{{3}}` Phone Number, `{{4}}` Customer Type, `{{5}}` Enquiry Message |

---

## Built-In Architecture Safeguards

1. **HMAC-SHA256 Signature Verification**: Blocks unauthorized webhooks attempting to forge orders or trigger messages.
2. **24-Hour Idempotency Memory**: Prevents duplicate WhatsApp alerts if an admin repeatedly clicks a status button.
3. **Automatic Phone Number Normalization**: Strips formatting spaces, hyphens, and automatically prepends India country code (`91`) for 10-digit mobile numbers.
4. **Resilient Error Capture**: If the Meta API fails or an unapproved template is requested, the workflow catches the error gracefully, displays the failure details in n8n execution history, and preserves system stability.
