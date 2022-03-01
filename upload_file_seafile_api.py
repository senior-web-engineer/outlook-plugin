#!/usr/bin/env python
# -*- coding: utf-8 -*-
import requests

URL = "https://storage.luckycloud.de"
LIBRARY_ID = "e78d6cb8-37d1-443b-962c-20156f5214a3"
FILE_PATH = "/home/viktor/Dokumente/seadrive_customizing/icon_16.ico"

values = {'username': 'demo@luckycloud.de',
          'password': 'q1w2e3R4'}

response = requests.post(
    f"{URL}/api2/auth-token/", data=values
)
print(response.json())
token = response.json()["token"]


def get_upload_link(url):
    resp = requests.get(
        url, headers={'Authorization': 'Token {token}'. format(token=token)}
    )
    return resp.json()


if __name__ == "__main__":
    upload_link = get_upload_link(
        f'{URL}/api2/repos/{LIBRARY_ID}/upload-link/?p=/test/'
    )
    print(upload_link)
    response = requests.post(
        upload_link, data={'filename': 'icon_16.ico', 'parent_dir': '/test/'},
        files={'file': open(FILE_PATH, 'rb')},
        headers={'Authorization': 'Token {token}'. format(token=token)}
    )
    print(response)
