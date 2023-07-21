import bardapi
from bardapi import Bard
import os
import sys
import requests



def __getForm(input_text, data):
    input_text = data+'에 대한 블로그 글을 작성할거야. 제목과 태그가 필요해. 이 JSON 포맷에 맞춰서 작성해줘 {title: 제목, titleEn: "영어 제목", tag: "comma로 구분된 키워드 10개", content: ""}'
    res = bard.get_answer(input_text)
    return res


os.environ['_BARD_API_KEY']="YAjVbN0EFa7fykmLrCMMBo00GiegONa-CRi727-8pQPoTvo-mv8hCxOHH7AT58qKtwvssA."

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

input_text = data+'에 대한 블로그 글을 Html 서식에 맞춰서 한글로 작성해줘. 2000글자 이상의 글이어야 해. 줄바꿈은 하지 말아줘.'
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
