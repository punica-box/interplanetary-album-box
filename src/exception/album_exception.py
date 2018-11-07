#!/usr/bin/env python3
# -*- coding: utf-8 -*-


class AlbumException(Exception):
    def __init__(self, error: dict):
        super().__init__(error['code'], error['msg'])


class AlbumError:
    @staticmethod
    def get_error(code: int, msg: str) -> dict:
        error = dict()
        error['code'] = code
        error['msg'] = msg
        return error

    @staticmethod
    def other_error(msg: str) -> dict:
        if isinstance(msg, bytes):
            try:
                msg = msg.decode()
                msg = 'Other Error, ' + msg
            except UnicodeDecodeError:
                msg = 'Other Error'
        return AlbumError.get_error(60000, msg)

    invalid_private_key = get_error.__func__(10000, 'the length of private key should be 32 bytes.')
    invalid_public_key = get_error.__func__(10001, 'the length of public key should be 64 bytes.')
