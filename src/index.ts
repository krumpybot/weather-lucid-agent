import { createAgent } from '@lucid-agents/core';
import { createAgentApp } from '@lucid-agents/hono';
import { http } from '@lucid-agents/http';
import { payments } from '@lucid-agents/payments';
import { z } from 'zod';

const agent = await createAgent({
  name: 'weather-agent',
  version: '1.0.0',
  description:
    'Weather lookup API - charges $0.001 per lookup via x402. Built via TaskMarket bounty (taskmarket.xyz).',
})
  .use(http())
  .use(
    payments({
      config: {
        payTo:
          process.env.PAY_TO_ADDRESS ||
          '0x71A2CED2074F418f4e68a0A196FF3C1e59Beb32E',
        network: 'eip155:8453',
        facilitatorUrl: 'https://facilitator.xgate.run',
      },
    })
  )
  .build();

const { app, addEntrypoint } = await createAgentApp(agent);

addEntrypoint({
  key: 'weather',
  description: 'Get current weather conditions for a city',
  price: '0.001',
  input: z.object({
    city: z.string().describe('City name, e.g. Sydney'),
  }),
  output: z.object({
    city: z.string(),
    temp_c: z.number(),
    condition: z.string(),
    humidity: z.number(),
  }),
  handler: async (ctx) => {
    const city = encodeURIComponent(ctx.input.city);

    // Use wttr.in for simplicity (returns JSON with ?format=j1)
    const wttrRes = await fetch(`https://wttr.in/${city}?format=j1`);
    const data = (await wttrRes.json()) as any;

    const current = data.current_condition?.[0];
    if (!current) {
      throw new Error(`Weather data not available for ${ctx.input.city}`);
    }

    return {
      output: {
        city: ctx.input.city,
        temp_c: parseFloat(current.temp_C),
        condition: current.weatherDesc?.[0]?.value || 'Unknown',
        humidity: parseInt(current.humidity, 10),
      },
    };
  },
});

const port = Number(process.env.PORT ?? 3000);
const server = Bun.serve({ port, fetch: app.fetch });
console.log(`Weather agent ready at http://${server.hostname}:${server.port}`);
console.log(`  GET /entrypoints/weather/invoke?city=Sydney - $0.001/lookup`);
console.log(`  GET /.well-known/agent.json - Agent manifest`);
