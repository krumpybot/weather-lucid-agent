# Weather Lucid Agent (x402)

A paid weather lookup API built with the Lucid Agents SDK. Charges **$0.001** per lookup via **x402** and returns current conditions for a requested city.

Built for a TaskMarket bounty — https://taskmarket.xyz

## What it does

- `GET /entrypoints/weather/invoke?city=Sydney`
- Returns: `{ city, temp_c, condition, humidity }`
- Enforces x402 payment for paid entrypoint access

## Deploy (Railway)

```bash
railway init
railway up
```

Set the optional payment address:

```bash
railway variables set PAY_TO_ADDRESS=0xYourAddress
```

## Usage

### Unpaid request (expect 402)

```bash
curl -i "http://localhost:3000/entrypoints/weather/invoke?city=Sydney"
```

### Paid request (example)

Use your x402 client/wallet to attach a valid payment header. Example (placeholder header):

```bash
curl -i \
  -H "x402-payment: <VALID_PAYMENT_HEADER>" \
  "http://localhost:3000/entrypoints/weather/invoke?city=Sydney"
```

Response:

```json
{
  "city": "Sydney",
  "temp_c": 24,
  "condition": "Partly cloudy",
  "humidity": 54
}
```

## License

MIT
