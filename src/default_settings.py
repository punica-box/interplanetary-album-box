#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import binascii
import os

import json

from ontology.ont_sdk import OntologySdk
from ontology.wallet.wallet_manager import WalletManager
from ontology.smart_contract.neo_contract.abi.abi_info import AbiInfo

ROOT_FOLDER = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WALLET_PATH = os.path.join(ROOT_FOLDER, 'wallet', 'wallet.json')
STATIC_FOLDER = os.path.join(ROOT_FOLDER, 'src', 'static')
CONTRACTS_FOLDER = os.path.join(ROOT_FOLDER, 'contracts')
TEMPLATE_FOLDER = os.path.join(STATIC_FOLDER, 'templates')
ASSETS_FOLDER = os.path.join(STATIC_FOLDER, 'assets')
ALBUM_FOLDER = os.path.join(STATIC_FOLDER, 'album')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp'}
IPFS_HOST = '127.0.0.1'
IPFS_PORT = 5001
GAS_LIMIT = 20000000
GAS_PRICE = 500
ONT_RPC_ADDRESS = 'http://polaris3.ont.io:20336'
CONTRACT_ADDRESS_HEX = '9026b8595d5c97a3ffb41d9c7aadaccfde82c40b'
CONTRACT_ADDRESS_BYTEARRAY = bytearray(binascii.a2b_hex(CONTRACT_ADDRESS_HEX))
CONTRACT_ADDRESS_BYTEARRAY.reverse()
ONTOLOGY = OntologySdk()
ONTOLOGY.rpc.set_address(ONT_RPC_ADDRESS)
with open(os.path.join(CONTRACTS_FOLDER, 'interplanetary-album.json')) as f:
    CONTRACT_ABI = json.loads(f.read())
    entry_point = CONTRACT_ABI.get('entrypoint', '')
    functions = CONTRACT_ABI['abi']['functions']
    events = CONTRACT_ABI.get('events', list())
    ABI_INFO = AbiInfo(CONTRACT_ADDRESS_HEX, entry_point, functions, events)
WALLET_MANAGER = WalletManager()
WALLET_MANAGER.open_wallet(WALLET_PATH)
