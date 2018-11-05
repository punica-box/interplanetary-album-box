#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from boa.builtins import concat
from boa.interop.System.Runtime import CheckWitness, Serialize, Deserialize
from boa.interop.System.Storage import Put, GetContext, Get
from boa.interop.System.Action import RegisterAction

ctx = GetContext()

ITEM_PREFIX = "ITEM"

itemPut = RegisterAction('Put', 'ipfs_hash')
itemPutFail = RegisterAction('PutFail', 'ipfs_hash')
itemRemove = RegisterAction('Remove', 'ipfs_hash')
itemRemoveFail = RegisterAction('RemoveFail', 'ipfs_hash')


def main(operation, args):
    if operation == 'put_one_item':
        return put_one_item(args[0], args[1], args[2])
    elif operation == 'get_item_list':
        return get_item_list(args[0])
    elif operation == 'del_ont_item':
        return del_ont_item(args[0], args[1])
    else:
        return False


def concat_key(str1, str2):
    return concat(concat(str1, '_'), str2)


def is_item_exist(item_list, ipfs_hash):
    for item in item_list:
        if item[0] == ipfs_hash:
            return True
    return False


def put_one_item(ont_id, ipfs_hash, ext):
    if not CheckWitness(ont_id):
        return False
    item_key = concat_key(ITEM_PREFIX, ont_id)
    item_list_info = Get(ctx, item_key)
    item_list = []
    if item_list_info:
        item_list = Deserialize(item_list_info)
    if is_item_exist(item_list, ipfs_hash):
        itemPutFail(ipfs_hash)
        return False
    item = [ipfs_hash, ext]
    item_list.append(item)
    item_list_info = Serialize(item_list)
    Put(ctx, item_key, item_list_info)
    itemPut(ipfs_hash)
    return True


def get_item_list(ont_id):
    item_key = concat_key(ITEM_PREFIX, ont_id)
    item_list_info = Get(ctx, item_key)
    item_list = []
    if item_list_info:
        item_list = Deserialize(item_list_info)
    return item_list


def del_ont_item(ont_id, ipfs_hash):
    if not CheckWitness(ont_id):
        return False
    item_key = concat_key(ITEM_PREFIX, ont_id)
    item_list_info = Get(ctx, item_key)
    item_list = []
    if item_list_info:
        item_list = Deserialize(item_list_info)
    for item in item_list:
        if item[0] == ipfs_hash:
            item_list.remove(item)
            itemRemove(ipfs_hash)
            return True
    itemRemoveFail(ipfs_hash)
    return True
