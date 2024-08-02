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
const requestBuilderIoUsersUrl = 'https://cdn.builder.io/api/v1/users?apiKey=a73e01a1c6a34697ab20d49c30aab093';

type User = {
  id: string;
  name: string;
  email: string;
}
const getBuilderIoUser = async (userId: string) => {
  const res = await fetch(requestBuilderIoUsersUrl, {
    method: 'GET',
    headers: {
      Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjFkYmUwNmI1ZDdjMmE3YzA0NDU2MzA2MWZmMGZlYTM3NzQwYjg2YmMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYnVpbGRlci0zYjBhMiIsImF1ZCI6ImJ1aWxkZXItM2IwYTIiLCJhdXRoX3RpbWUiOjE3MjI0OTM4NzMsInVzZXJfaWQiOiJyUGEzU2pabzFEWE5yZ2prRHpHUWx3RjR4SmcxIiwic3ViIjoiclBhM1NqWm8xRFhOcmdqa0R6R1Fsd0Y0eEpnMSIsImlhdCI6MTcyMjU2MjA5NywiZXhwIjoxNzIyNTY1Njk3LCJlbWFpbCI6ImRsX2Zyb250ZW5kQG5obi1jb21tZXJjZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJkbF9mcm9udGVuZEBuaG4tY29tbWVyY2UuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.qebpdJOVf6_aG1uCaP9ffvxnxIuxb_qPUauD3-WCA2nsqHHskfSWZY55148GMAJ79hjwRLMOwJpOZUWsMAijEDo7b7xCVlA2tjlniA0iO5KLyzdWpZ4SFBdpoyEC6IoF3puxb0JZu-V1SSuQSXDj9CJ8c9YF7R0gII1Kgx0GAoWOUlXCE-st2EkJjPeCg6cuuYEkFayBUM4THpSCFaQ_dYMTpxjyBlm-_HTjNvS05ITPv9EE0luHoMxQwXRFBG2l1yWi5PXkpxMmW24OY2kQU0SXf90WDQuFfG3lyeOn1Qn9Bti35XQMBo3A2CeEkznIEnENm-NHNgCfW8ePoB8zxg'
    }
  })

  const data = await res.json();

  const users = (data?.users ?? []) as User[];

  const user = users.find(({ id }) => id === userId)

  // return user ? `${user.name}(${user.email})`: userId;
  return JSON.stringify(user);
}; 

const formatDate = (dateInput: number) => {
  const updatedDate = new Date(dateInput);

  const YYYY = updatedDate.getFullYear(); 

  const month = updatedDate.getMonth() + 1;
  const MM = String(month).padStart(2, '0');
  
  const date = updatedDate.getDate();
  const DD = String(date).padStart(2, '0');

  const hour = updatedDate.getHours();
  const hh = String(hour).padStart(2, '0');

  const min = updatedDate.getMinutes();
  const mm = String(min).padStart(2, '0');

  const second = updatedDate.getSeconds();
  const ss = String(second).padStart(2, '0');

  return `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`; 
}


const callDoorayIncomingHook = async (body: any) => {
  const { newValue, previousValue } = body;

  
  let message = '빌더IO 알림';
  

  console.log('New Value:', newValue);
  console.log('Previous Value:', previousValue);

  if (newValue === null) {
    // 콘텐츠 삭제
    message = `콘텐츠가 삭제되었습니다.\n${JSON.stringify(previousValue)}`
  }

  if (previousValue === null) {
    // 콘텐츠 처음 생성
     message = `콘텐츠가 생성되었습니다.\n${JSON.stringify(newValue)}`
  }

  const {published, name, lastUpdated, lastUpdateBy} = newValue;

  const userInfo = await getBuilderIoUser(lastUpdateBy);

  const contentTitle = `콘텐츠 제목 : ${name}`;
  const lastUpdatedDate = `마지막 수정 날짜 : ${formatDate(lastUpdated)}`;
  const lastUpdatedPerson = `마지막 수정 담당자 : ${userInfo}`;
  const action = `액션 : ${published}`;

  message = `${contentTitle}\n${lastUpdatedDate}\n${lastUpdatedPerson}\n${action}`;

  await fetch(doorayIncomingUrl, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },

    body: JSON.stringify(
      {
        botName: "BuilderIO 봇",
        botIconImage: "https://github.com/user-attachments/assets/c420a811-a504-4ac3-a0d5-a6f042b9cdd6",
        text: message
      } 
  )
});
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const data = { 
      pokemon: {
          name: '꼬부기'
      }
    }
  
    res.status(200).json(data);
  } else if (req.method === 'POST') {
    // published: 배포 여부, name: 콘텐츠 이름, lastUpdated: 마지막 수정날짜, lastUpdateBy: 마지막 수정자(해시값)
    await callDoorayIncomingHook(req?.body);
    return res.status(200).json({ message: 'Webhook received and processed', req });
  } else {

  }
}