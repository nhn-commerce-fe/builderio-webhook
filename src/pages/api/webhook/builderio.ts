import type { NextApiRequest, NextApiResponse } from 'next';

import { toZonedTime, format } from 'date-fns-tz';


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
      Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjFkYmUwNmI1ZDdjMmE3YzA0NDU2MzA2MWZmMGZlYTM3NzQwYjg2YmMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYnVpbGRlci0zYjBhMiIsImF1ZCI6ImJ1aWxkZXItM2IwYTIiLCJhdXRoX3RpbWUiOjE3MjI0OTM4NzMsInVzZXJfaWQiOiJyUGEzU2pabzFEWE5yZ2prRHpHUWx3RjR4SmcxIiwic3ViIjoiclBhM1NqWm8xRFhOcmdqa0R6R1Fsd0Y0eEpnMSIsImlhdCI6MTcyMjU4NTU3OCwiZXhwIjoxNzIyNTg5MTc4LCJlbWFpbCI6ImRsX2Zyb250ZW5kQG5obi1jb21tZXJjZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJkbF9mcm9udGVuZEBuaG4tY29tbWVyY2UuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.tRn8You4XXUz69l_TUPdLhbDHTWMR4bqQsfTPxYomCTqC7TYMuKkeXwZSgQdUKQ_4nLvDtrLqo6zs0xhToTpUwQDHy6LaWbfmBG6RQT5TabS1Y6wlg0w89m_WwiyaleMHbFoJ5TxXxe1argkJhFidNjGq3w7pxLB6Br0XxWEl4ZMR-ZY5YQV7SM2fhZxVxtdDFJ9wG90iucsHqrqOIKsNlfAtGXI1MPn7Jt_5yws3jhKIe_VlTnXgph_vWbXDqicmsKBBd74nQxVDObycmwR1TVM_d5Ut-_lTzufulehwn2qMe_tcBJbAM2SSYS67gU1Q_9qwwSxHYM7k28NJCNpow'
    }
  })

  const data = await res.json();

  const users = (data?.users ?? []) as User[];

  const user = users.find(({ id }) => id === userId)

  return user ? `${user.name}(${user.email})`: userId;
  // return JSON.stringify(data);
}; 

const formatDate = (dateInput: number) => {
  const date = new Date(dateInput);
  const timeZone = "Asia/Seoul";
  const zonedDate = toZonedTime(date, timeZone);
  const pattern = "yyyy.MM.dd HH:mm:ss.SSS";

  return format(zonedDate, pattern, { timeZone: "Asia/Seoul" });
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
        botName: "BuilderIO",
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
          name: 'NHN COMMERCE 프론트엔드개발팀'
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