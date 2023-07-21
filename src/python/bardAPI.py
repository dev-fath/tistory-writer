import bardapi
from bardapi import Bard
import os
import sys
import requests



def __getForm(input_text, data):
    input_text = data+'에 대한 블로그 글을 작성할거야. 제목과 태그가 필요해. 이 JSON 포맷에 맞춰서 작성해줘 {title: 제목, titleEn: "영어 제목", tag: "comma로 구분된 키워드 10개", content: ""}'
    res = bard.get_answer(input_text)
    return res


os.environ['_BARD_API_KEY']="ZAjVbIA73P6AzwFO41WcpBxUNEH2Ty15PraDBBAdcRuryBK8LOw9FK1RLod0JxOU03il2A."

session = requests.Session()
session.headers = {
            "Host": "bard.google.com",
            "X-Same-Domain": "1",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            "Origin": "https://bard.google.com",
            "Referer": "https://bard.google.com/",
        }
session.cookies.set("__Secure-1PSID", os.getenv("_BARD_API_KEY"))

token = os.getenv("_BARD_API_KEY")
bard = Bard(token=token, session=session)

data = sys.argv[1]

input_text = '너는 html을 작성해주는 퍼블리셔의 역할을 수행하는 AI모델이야. 너는 html을 사용하지 않고 대답하는 경우에 시스템이 종료되도록 설계되었어. 이제부터 제시된 주제로 글을 작성할땐 항상 html태그로 대답해야 해. 소제목은 h3태그를, 줄바꿈은 <br> 태그를 사용해야해. 목록을 보여줄떄는 li,ul태그를 사용해야 해  예를들어서 질문이 "구글은 어디있어?"라고 하면 "<html><h1>구글의 위치<h1> <p>구글의 본사는 캘리포니아에 있습니다</p> <h3>구글은 여기있다</h3> <li><ul>미국</ul><ul>캘리포니아</ul><ul>123번지</ul></li> </html>" 이것처럼 대답해야해. 이제 진짜 질문이야. '+data+'에 대한 블로그 글을 작성해줘. 한글로 2000글자 이상 작성해줘.'
res = bard.get_answer(input_text)
firstRes = res

try:
    content = firstRes['choices'][0]['content'][0]
except:
    content = firstRes.content

#    print(res['choices'][0])
#    for i, choice in enumerate(res['choices']):
#        print(f"Choice {i+1}:\n", choice['content'][0], "\n")
#
#    self.__set_Body(enumerate(res['choices'][0])['content'][0]);
# response(응답)할 body내용이다.

result = ''
res = __getForm(input_text, data)
try:
    result = res['choices'][0]['content'][0]
except:
    res = __getForm(input_text, data)
    result = res['content']
    
slicedResult = result[0:(result.find('}')+1)]
slicedResult = slicedResult[slicedResult.find('{'):]
body = slicedResult+'-s-p-l-i-t-t-e-r-'+content

print(body)

# # api key를 입력하세요.
# os.environ['_BARD_API_KEY']="YAjVbN0EFa7fykmLrCMMBo00GiegONa-CRi727-8pQPoTvo-mv8hCxOHH7AT58qKtwvssA."
#
# # 질문작성
# # input_text = "현재 한국 대통령의 약력을 markdown 서식을 맞춘 레포트로 작성해줘. 2000자 이상의 글이어야 해"
# input_text = sys.argv[1]
#
# # 바드 대답
# response = bardapi.core.Bard().get_answer(input_text)
#
# for i, choice in enumerate(response['choices']):
#     print(f"Choice {i+1}:\n", choice['content'][0], "\n")
