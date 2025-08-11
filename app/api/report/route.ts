import { NextRequest } from "next/server";

import axios from "axios";

interface RequestBody {
  pws_id: string;
}

export async function POST(req: NextRequest) {
  const { pws_id }: RequestBody = await req.json();

  try {
    const response = await axios.get(
      `https://api.gosimplelab.com/api/utilities/results?pws_id=${pws_id}&result_type=mixed`
    );

    const data = response.data;
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Error fetching data", { status: 500 });
  }
}
