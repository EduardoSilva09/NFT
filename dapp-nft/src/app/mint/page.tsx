"use client"

import { ChangeEvent, useEffect, useState } from "react";
import { login, mint } from "../services/Web3Services";
import Layout from '@/components/Layout';

export default function MintPage() {
  const [wallet, setWallet] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const wallet = localStorage.getItem("wallet");
    if (wallet) setWallet(wallet);
  }, [])

  function btnLoginClick() {
    setMessage("Logging In...");
    login()
      .then(wallet => {
        setWallet(wallet);
        localStorage.setItem("wallet", wallet)
        setMessage("");
      })
      .catch(err => setMessage(err.message));
  }

  function btnLogoutClick() {
    setMessage("Logging Out...");
    setWallet("");
    localStorage.removeItem("wallet");
    setMessage("");
  }

  function btnMintClick() {
    setMessage("Minting...");
    mint(quantity)
      .then(tx => {
        setMessage("Tx Id: " + (tx || "error"))
        setQuantity(1);
      })
      .catch(err => setMessage(err.message));
  }

  function onQuantityChange(evt: ChangeEvent<HTMLInputElement>) {
    const quantity = parseInt(evt.target.value);

    if (quantity > 5)
      setQuantity(5)
    else
      setQuantity(quantity);
  }
  return (
    <Layout title="Mint | Dragon NFT Collection">
      <div className="relative pt-16 pb-32 flex content-center items-center justify-center"
        style={{
          minHeight: "75vh"
        }}>
        <div className="absolute top-0 w-full h-full bg-center bg-cover"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1514922121266-75835418bbf1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"
          }}>
          <span id="blackOverlay" className="w-full h-full absolute opacity-75 bg-black"></span>
        </div>
        <div className="container relative mx-auto">
          <div className="items-center flex flex-wrap">
            <div className="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
              <div className="pr-12">
                <h1 className="text-white font-semibold text-5xl">
                  Mint your token(s)
                </h1>
                {
                  !wallet
                    ? <>
                      <p className="mt-4 text-lg text-gray-300">
                        Connect your wallet and start to minting right now.
                      </p>
                      <div className="text-center mt-6">
                        <button
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2  px-4  rounded inline-flex items-center"
                          type="button"
                          onClick={btnLoginClick}
                        >
                          <img src="/metamask.svg" width={64} className="pr-3" /> Connect your wallet
                        </button>
                      </div>
                    </>
                    : (<>
                      <p className="mt-4 text-lg text-gray-300">
                        Choose up to 5 mints in a row to save with taxes.
                      </p>
                      <div className="mb-4 mt-8 inline-flex flex-wrap">
                        <input
                          type="number"
                          id="quantity"
                          placeholder="1"
                          value={quantity}
                          onChange={onQuantityChange}
                          className="m-0 block rounded-l border border-r-0 border-solid border-neutral-300 bg-white bg-clip-padding px-3 py-[0.25rem] outline-none" />
                        <button
                          onClick={btnMintClick}
                          className="relative z-[2] rounded-r text-bold bg-gray-300 hover:bg-gray-400 px-6 py-6 text-sm font-medium uppercase leading-tight shadow-md"
                          type="button">
                          Mint
                        </button>
                      </div>
                      <div className="text-center mt-6">
                        <a
                          href={`${process.env.OPENSEA_URL}/${wallet}`}
                          target="_blank"
                          type="button"
                          className="bg-green-800 hover:bg-green-900 text-white font-bold py-3 px-3 rounded inline-flex items-center ml-3">See at OpenSea</a>
                        <button
                          onClick={btnLogoutClick}
                          type="button"
                          className="bg-red-800 hover:bg-red-900 text-white font-bold py-3 px-3 rounded inline-flex items-center ml-3">Logout</button>
                      </div>
                    </>)
                }
                {
                  message
                    ? <div className="bg-red-900 text-white font-bold rounded shadow py-3 mt-3">{message}</div>
                    : <></>
                }
              </div>
            </div>

          </div>
        </div>
        <div
          className="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden"
          style={{ height: "70px" }}
        >
          <svg
            className="absolute bottom-0 overflow-hidden"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            version="1.1"
            viewBox="0 0 2560 100"
            x="0"
            y="0"
          >
            <polygon
              className="text-gray-300 fill-current"
              points="2560 0 2560 100 0 100"
            ></polygon>
          </svg>
        </div>
      </div>
      <section className="pb-20 bg-gray-300 -mt-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap">
            <div className="lg:pt-12 pt-6 w-full md:w-4/12 px-4 text-center">
              <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg">
                <div className="px-4 py-5 flex-auto">
                  <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-red-400">
                    #1
                  </div>
                  <p className="mt-2 mb-4 text-gray-600">
                    Connect your browser wallet configured to BNB Smart Chain (BSC)
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full md:w-4/12 px-4 text-center">
              <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg">
                <div className="px-4 py-5 flex-auto">
                  <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-blue-400">
                    #2
                  </div>
                  <p className="mt-2 mb-4 text-gray-600">
                    Choose how many tokens do you&apos;ll mint. Up to five per wallet. More you mint in a row, more taxes you save.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 w-full md:w-4/12 px-4 text-center">
              <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg">
                <div className="px-4 py-5 flex-auto">
                  <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-green-400">
                    #3
                  </div>
                  <p className="mt-2 mb-4 text-gray-600">
                    Confirm your transaction and see your tokens in your wallet and your arts in OpenSea account or similar sites.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="pb-20 relative block bg-gray-900">
        <div
          className="bottom-auto top-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden -mt-20"
          style={{ height: "80px" }}
        >
          <svg
            className="absolute bottom-0 overflow-hidden"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            version="1.1"
            viewBox="0 0 2560 100"
            x="0"
            y="0"
          >
            <polygon
              className="text-gray-900 fill-current"
              points="2560 0 2560 100 0 100"
            ></polygon>
          </svg>
        </div>

        <div className="container mx-auto px-4 lg:pt-24 lg:pb-64">
          <div className="flex flex-wrap text-center justify-center">
            <div className="w-full lg:w-6/12 px-4">
              <h2 className="text-4xl font-semibold text-white">
                Exclusive Collection
              </h2>
              <p className="text-lg leading-relaxed mt-4 mb-4 text-gray-500">
                We have only 9 exclusive seats on our rocket, each reserved for our NFT collection avatars. Will you claim your spot?
              </p>
            </div>
          </div>
          <div className="flex flex-wrap mt-12 justify-center">
            <div className="w-full lg:w-3/12 px-4 text-center">
              <div className="text-gray-900 p-3 w-12 h-12 shadow-lg rounded-full bg-white inline-flex items-center justify-center">
                <img src="/gift.svg" />
              </div>
              <h6 className="text-xl mt-5 font-semibold text-white">
                Mint First
              </h6>
              <p className="mt-2 mb-4 text-gray-500">
                Now is the perfect time to join us. Mint your NFT and be part of our journey as we grow together.
              </p>
            </div>
            <div className="w-full lg:w-3/12 px-4 text-center">
              <div className="text-gray-900 p-3 w-12 h-12 shadow-lg rounded-full bg-white inline-flex items-center justify-center">
                <img src="/shopping-cart.svg" />
              </div>
              <h5 className="text-xl mt-5 font-semibold text-white">
                Sell Later
              </h5>
              <p className="mt-2 mb-4 text-gray-500">
                You're ready to fly alone? Sell your token at OpenSea, probably by higher prices.
              </p>
            </div>
            <div className="w-full lg:w-3/12 px-4 text-center">
              <div className="text-gray-900 p-3 w-12 h-12 shadow-lg rounded-full bg-white inline-flex items-center justify-center">
                <img src="/calendar.svg" />
              </div>
              <h5 className="text-xl mt-5 font-semibold text-white">
                Enjoy Forever
              </h5>
              <p className="mt-2 mb-4 text-gray-500">
                Some benefits stay forever dor all people that had our tokens.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout >);
}
