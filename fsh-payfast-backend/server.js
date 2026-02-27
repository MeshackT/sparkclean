import express from "express";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PAYFAST_URL =
  process.env.PAYFAST_MODE === "sandbox"
    ? "https://sandbox.payfast.co.za/eng/process"
    : "https://www.payfast.co.za/eng/process";

/**
 * Generate PayFast signature
 */
function generateSignature(data, passphrase = "") {
  const sorted = Object.keys(data)
    .sort()
    .map(key => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, "+")}`)
    .join("&");

  const stringToSign = passphrase
    ? `${sorted}&passphrase=${encodeURIComponent(passphrase)}`
    : sorted;

  return crypto.createHash("md5").update(stringToSign).digest("hex");
}

app.post("/create-payment", (req, res) => {
  const { orderId, amount, item_name, customer } = req.body;

  if (!orderId || !amount || !item_name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const data = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID,
    merchant_key: process.env.PAYFAST_MERCHANT_KEY,
    m_payment_id: orderId,
    amount: Number(amount).toFixed(2),
    item_name,
    return_url: "https://products.fshsystems.co.za/success.html",
    cancel_url: "https://products.fshsystems.co.za/cancel.html",
    notify_url: "https://your-backend.onrender.com/notify",

    custom_str1: customer?.name || "",
    custom_str2: customer?.phone || "",
    custom_str3: customer?.address || ""
  };

  data.signature = generateSignature(
    data,
    process.env.PAYFAST_PASSPHRASE || ""
  );

  res.json({
    payfast_url: PAYFAST_URL,
    fields: data
  });
});

/**
 * ITN endpoint (sandbox-safe)
 */
app.post("/notify", (req, res) => {
  console.log("Sandbox ITN received:", req.body);
  res.status(200).send("OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`PayFast backend running on port ${PORT}`)
);