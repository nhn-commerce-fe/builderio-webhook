import type { NextApiRequest, NextApiResponse } from 'next';

import { toZonedTime, format } from 'date-fns-tz';


const doorayIncomingUrl = 'https://hook.dooray.com/services/1590498595903871702/3860379888550721054/7LG5oUm9QOqejchIWH4tlA';
const requestBuilderIoUsersUrl = 'https://cdn.builder.io/api/v1/users?apiKey=a73e01a1c6a34697ab20d49c30aab093';

type User = {
  id: string;
  name: string;
  email: string;
}

const users = [
  {
      "otherIntentSelect": "",
      "role": "",
      "id": "8cBBIK8TYPUzfqFwbftfDqnQK1W2",
      "email": "dl_design@nhn-commerce.com",
      "jobFunctions": [
          "designer"
      ],
      "name": "Design",
      "ownerId": "8cBBIK8TYPUzfqFwbftfDqnQK1W2",
      "roles": {
          "c5d00a9d8d714e7582390f7cf7b3e8bb": "admin",
          "2028c8759b13430aa9220ce871a97cd1": "admin",
          "9acc7a867c5742218a671e07d095a374": "admin",
          "a73e01a1c6a34697ab20d49c30aab093": "developer"
      },
  },
  {
      "roles": {
          "a73e01a1c6a34697ab20d49c30aab093": "developer"
      },
      "name": "웹서비스개발파트",
      "organizations": [
          "a73e01a1c6a34697ab20d49c30aab093",
          "f98b53670d02415eaaaf8deffadf8586"
      ],
      "id": "QQTXgx0orsXh5oMsBLicAfiL92w1",
      "ownerId": "QQTXgx0orsXh5oMsBLicAfiL92w1",
      "email": "gd00002967@nhn-commerce.com",
      "jobFunctions": [
          "developer"
      ],
  },
  {
      "name": "",
      "id": "ia4M3qbhA8M5CFendYxWQpH9vQe2",
      "ownerId": "ia4M3qbhA8M5CFendYxWQpH9vQe2",
      "email": "dl_business_builder@nhn-commerce.com",
      "jobFunctions": [
          "executive"
      ],
  },
  {
      "roles": {
          "a73e01a1c6a34697ab20d49c30aab093": "creator"
      },
      "name": "",
      "organizations": [
          "a73e01a1c6a34697ab20d49c30aab093",
          "f98b53670d02415eaaaf8deffadf8586"
      ],
      "id": "lgQYExrJY2YQ5doDaUj0oFGq7H32",
      "email": "dl_mkt_builder@nhn-commerce.com",
      "jobFunctions": [
          "marketer"
      ],
  },
  {
      "roles": {
          "a73e01a1c6a34697ab20d49c30aab093": "developer"
      },
      "name": "FE개발팀",
      "id": "rPa3SjZo1DXNrgjkDzGQlwF4xJg1",
      "ownerId": "rPa3SjZo1DXNrgjkDzGQlwF4xJg1",
      "email": "dl_frontend@nhn-commerce.com",
      "jobFunctions": [
          "developer"
      ],
  },
  {
      "role": "",
      "id": "tiOFL8nDnqSw5cN00SFni2DMBI03",
      "email": "dl_builder_admin@nhn-commerce.com",
      "name": "NHN커머스",
      "jobFunctions": [
          "product"
      ],
      "ownerId": "tiOFL8nDnqSw5cN00SFni2DMBI03",
      "roles": {
          "f98b53670d02415eaaaf8deffadf8586": "admin",
          "2046e6bdb9d64878be4f08a616dfc9e7": "admin",
          "4eec6762a4164d889ed721cfc7474605": "admin",
          "d85b50f898f941e18bc0cae7e8dbc49a": "admin",
          "a73e01a1c6a34697ab20d49c30aab093": "admin",
          "a63974a3427f4e7a900e38654d5f9372": "admin",
          "8e757552fd824edc8466f9a4318dcefb": "admin"
      },
  }
];

const getBuilderIoUser = async (userId: string) => {
  // users api 아직 제공안함
  // const res = await fetch(requestBuilderIoUsersUrl, {
  //   method: 'GET',
  //   headers: {
  //     Authorization: 'Bearer bpk-bf61da2beeef44c9a600ba4a851ef488'
  //   }
  // })

  // const data = await res.json();

  // const users = (data?.users ?? []) as User[];

  const user = users.find(({ id }) => id === userId)

  const userName = user?.name ? `(${user.name})`: '';

  return user ? `${user.email}${userName}`: userId;
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