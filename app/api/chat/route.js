import { NextResponse } from "next/server";

const CHAT_URL = "https://chat-r3rzgwfsbq-uc.a.run.app";
const DELETE_CHAT_URL = "https://delete-chat-r3rzgwfsbq-uc.a.run.app";
const CREATE_CHAT_URL = "https://create-chat-r3rzgwfsbq-uc.a.run.app";

const LOCAL_HOST = "http://127.0.0.1:5001/quantum-coupon-ai/us-central1";
const LOCAL_CHAT_URL = LOCAL_HOST + "/chat";
const LOCAL_DELETE_CHAT_URL = LOCAL_HOST + "/delete_chat";
const LOCAL_CREATE_CHAT_URL = LOCAL_HOST + "/create_chat";

export const runtime = "edge";

export async function POST(request) {
  const data = await sendPOST(CHAT_URL, await request.json());
  console.log(data);

  return NextResponse.json(data, {
    status: 200,
  });
}

export async function DELETE(request) {
  const data = await sendPOST(DELETE_CHAT_URL, await request.json());
  console.log(data);

  return NextResponse.json(data, {
    status: 200,
  });
}

export async function GET(request) {
  const data = await sendGET(CREATE_CHAT_URL);
  console.log(data);

  return NextResponse.json(data, {
    status: 200,
  });
}

const sendGET = async (url) => {
  const response = await fetch(url);
  return response.json();
};

const sendPOST = async (url, payload) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };

  const response = await fetch(url, requestOptions);
  return response.json();
};
