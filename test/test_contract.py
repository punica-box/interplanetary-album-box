#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json
import unittest
import binascii

from ontology.ont_sdk import OntologySdk
from ontology.wallet.wallet_manager import WalletManager
from ontology.smart_contract.neo_contract.abi.abi_info import AbiInfo

ontology = OntologySdk()
remote_rpc_address = 'http://polaris3.ont.io:20336'
contract_address_hex = 'cf25ea1932ddbc9a03ce62131001d8bcdccc12ea'
contract_address_bytearray = bytearray(binascii.a2b_hex(contract_address_hex))
contract_address_bytearray.reverse()
ontology.set_rpc(remote_rpc_address)
root_folder = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
wallet_path = os.path.join(root_folder, 'wallet', 'wallet.json')
contracts_folder = os.path.join(root_folder, 'contracts')
contracts_path = os.path.join(contracts_folder, 'interplanetary-album.abi.json')
with open(contracts_path) as f:
    contract_abi = json.loads(f.read())
    entry_point = contract_abi.get('entrypoint', '')
    functions = contract_abi['abi']['functions']
    events = contract_abi.get('events', list())
    abi_info = AbiInfo(contract_address_hex, entry_point, functions, events)
wallet_manager = WalletManager()
wallet_manager.open_wallet(wallet_path)
password = input('password: ')
gas_limit = 20000000
gas_price = 500
acct = wallet_manager.get_account('AKeDu9QW6hfAhwpvCwNNwkEQt1LkUQpBpW', password)
ont_id_acct = wallet_manager.get_account('did:ont:AHBB3LQNpqXjCLathy7vTNgmQ1cGSj8S9Z', password)


class TestSmartContract(unittest.TestCase):
    def test_put_one_item(self):
        ipfs_address = 'QmaxL3ixbfG1mwQeKRdBPnYxqiESv5nkKg5UoppdvtZPfn'
        ext = '.jpg'
        put_one_item_func = abi_info.get_function('put_one_item')
        put_one_item_func.set_params_value((ont_id_acct.get_address().to_array(), ipfs_address, ext))
        tx_hash = ontology.neo_vm().send_transaction(contract_address_bytearray, ont_id_acct, acct, gas_limit,
                                                     gas_price, put_one_item_func, False)
        print(tx_hash)

    def test_get_item_list(self):
        get_item_list_func = abi_info.get_function('get_item_list')
        get_item_list_func.set_params_value((ont_id_acct.get_address().to_array(),))
        item_list = ontology.neo_vm().send_transaction(contract_address_bytearray, None, None, 0, 0, get_item_list_func,
                                                       True)
        if item_list is None or None in item_list:
            item_list = list()
        for index in range(len(item_list)):
            item_list[index][0] = binascii.a2b_hex(item_list[index][0])
            item_list[index][1] = binascii.a2b_hex(item_list[index][1])
            item_list[index][2] = binascii.a2b_hex(item_list[index][2])
            item_list[index][3] = binascii.a2b_hex(item_list[index][3])
        print(item_list)

    def test_clear_item_list(self):
        clear_item_list_func = abi_info.get_function('clear_item_list')
        clear_item_list_func.set_params_value((ont_id_acct.get_address().to_array(),))
        tx_hash = ontology.neo_vm().send_transaction(contract_address_bytearray, ont_id_acct, acct, gas_limit,
                                                     gas_price, clear_item_list_func, False)
        self.assertEqual(64, tx_hash)


if __name__ == '__main__':
    unittest.main()
