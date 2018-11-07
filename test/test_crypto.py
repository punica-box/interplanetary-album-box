#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import unittest

from ontology.wallet.wallet_manager import WalletManager

from src.crypto.ecies import ECIES

root_folder = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
wallet_path = os.path.join(root_folder, 'wallet', 'wallet.json')
wallet_manager = WalletManager()
wallet_manager.open_wallet(wallet_path)
password = input('password: ')
gas_limit = 20000000
gas_price = 500
acct = wallet_manager.get_account('AKeDu9QW6hfAhwpvCwNNwkEQt1LkUQpBpW', password)
ont_id_acct = wallet_manager.get_account('did:ont:AHBB3LQNpqXjCLathy7vTNgmQ1cGSj8S9Z', password)


class TestCrypto(unittest.TestCase):
    def test_encrypt_with_ont_id_in_cbc(self):
        ipfs_address = 'QmaxL3ixbfG1mwQeKRdBPnYxqiESv5nkKg5UoppdvtZPfn'
        ipfs_address_bytes = ipfs_address.encode('ascii')
        aes_iv, encode_g_tilde, cipher_text = ECIES.encrypt_with_ont_id_in_cbc(ipfs_address_bytes, ont_id_acct)
        decrypted_text_bytes = ECIES.decrypt_with_ont_id_in_cbc(aes_iv, encode_g_tilde, cipher_text, ont_id_acct)
        self.assertEqual(ipfs_address_bytes, decrypted_text_bytes)


if __name__ == '__main__':
    unittest.main()
