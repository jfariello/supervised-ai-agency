type ApifyDatasetItem = Record<string, unknown>;

export async function runApifyActor(actorId: string, input: Record<string, unknown>) {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    return {
      mode: "demo" as const,
      runId: "demo-run",
      datasetItems: [
        {
          company: "Demo Apify Lead",
          contactName: "Contacto Demo",
          email: "demo.apify@example.com",
          industry: "Servicios",
          country: "Argentina"
        }
      ]
    };
  }

  const started = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${token}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input)
  });

  if (!started.ok) {
    throw new Error(`Apify actor failed to start: ${started.status}`);
  }

  const run = await started.json();
  return {
    mode: "live" as const,
    runId: run.data.id as string,
    datasetItems: [] as ApifyDatasetItem[]
  };
}

export async function fetchApifyDataset(datasetId: string) {
  const token = process.env.APIFY_TOKEN;
  if (!token) return [] as ApifyDatasetItem[];

  const response = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?clean=true&token=${token}`);
  if (!response.ok) {
    throw new Error(`Apify dataset fetch failed: ${response.status}`);
  }

  return (await response.json()) as ApifyDatasetItem[];
}
