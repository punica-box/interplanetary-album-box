#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from math import ceil

from src.crypto.digest import sha256


def str_to_bytes(s: str) -> bytes:
    if isinstance(s, bytes):
        return s
    elif isinstance(s, str):
        return s.encode('latin-1')
    else:
        return bytes(list(s))


def int_to_little_bytes(value: int) -> bytes:
    bit_length = value.bit_length()
    length = ceil(bit_length / 8)
    byte_package = value.to_bytes(length, 'little', signed=True)
    return byte_package


def pbkdf2(seed: str or bytes, dk_len: int) -> bytes:
    """
    Derive one key from a seed.

    :param seed: the secret pass phrase to generate the keys from.
    :param dk_len: the length in bytes of every derived key.
    :return:
    """
    key = b''
    index = 1
    bytes_seed = str_to_bytes(seed)
    while len(key) < dk_len:
        key += sha256(b''.join([bytes_seed, int_to_little_bytes(index)]))
        index += 1
    return key[:dk_len]
