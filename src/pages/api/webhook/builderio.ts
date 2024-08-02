import type { NextApiRequest, NextApiResponse } from 'next';

// type ResponseData = {
//   message: string;
// };

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === 'POST') {
//     const { newValue, previousValue } = req.body;

//     console.log('New Value:', newValue);
//     console.log('Previous Value:', previousValue);

//     // Here you can add the logic to process the webhook data
//     // For example, updating your local database, invalidating cache, etc.

//     // Respond to the request indicating success
//     return res.status(200).json({ message: 'Webhook received and processed' });
//   } else {
//     // Handle any other HTTP methods
//     res.setHeader('Allow', ['POST']);
//     return res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }

const doorayIncomingUrl = 'https://hook.dooray.com/services/1590498595903871702/3860379888550721054/7LG5oUm9QOqejchIWH4tlA';


const callDoorayIncomingHook = async (params: any) => {
  await fetch(doorayIncomingUrl, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    // body: '{"botName": "MyBot", "botIconImage": "https://static.dooray.com/static_images/dooray-bot.png", "text":"Dooray!"}',
    body: JSON.stringify(
      {
        "botName": "BuilderIO 봇",
        "botIconImage": "https://static.dooray.com/static_images/dooray-bot.png",
        "text": "[WebHook Test Page] Publish"
      } 
  )
});
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(req, res);

  if (req.method === 'GET') {
    const data = { 
      pokemon: {
          name: '꼬부기'
      }
    }
  
    res.status(200).json(data);
  } else if (req.method === 'POST') {
    console.log('웹훅 발생!')
    const { newValue, previousValue } = req.body;

    console.log('New Value:', newValue);
    console.log('Previous Value:', previousValue);

    // Here you can add the logic to process the webhook data
    // For example, updating your local database, invalidating cache, etc.

    // Respond to the request indicating success
    // https://hook.dooray.com/services/1590498595903871702/3860379888550721054/7LG5oUm9QOqejchIWH4tlA 두레이훅으로보내야함
    await callDoorayIncomingHook(req);
    return res.status(200).json({ message: 'Webhook received and processed', req });
  } else {

  }
}