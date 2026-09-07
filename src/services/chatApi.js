const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;


export async function sendMessage(
  message,
  threadId = null
) {

  const payload = {
    message,
  };


  if (threadId) {

    payload.thread_id =
      threadId;

  }


  const response = await fetch(
    `${API_BASE_URL}/chat`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(
        payload
      ),
    }
  );


  if (!response.ok) {

    throw new Error(
      `Chat request failed: ${response.status}`
    );

  }


  return response.json();

}