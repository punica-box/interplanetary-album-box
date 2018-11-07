#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import hashlib


def __sha256(msg: bytes, is_hex: bool = False):
    m = hashlib.sha256()
    m.update(msg)
    if is_hex:
        return m.hexdigest()
    else:
        return m.digest()


def ripemd160(msg: bytes, is_hex: bool = False):
    h = hashlib.new('ripemd160')
    h.update(msg)
    if is_hex:
        return h.hexdigest()
    else:
        return h.digest()


def sha256(msg: bytes, offset: int = 0, length: int = 0, is_hex: bool = False):
    if offset != 0 and len(msg) > offset + length:
        msg = msg[offset:offset + length]
    return __sha256(msg, is_hex)


def hash256(msg: bytes, is_hex: bool = False) -> bytes or str:
    digest = sha256(sha256(msg), is_hex=is_hex)
    return digest


def hash160(msg: bytes, is_hex: bool = False) -> bytes or str:
    digest = ripemd160(__sha256(msg), is_hex)
    return digest
