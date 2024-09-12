"use client"

import { ChangeEvent, useEffect, useState } from "react";

export default function Home() {
  const [wallet, setWallet] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const wallet = localStorage.getItem("wallet");
    if (wallet) setWallet(wallet);
  }, [])

  function btnLoginClick() {
    setMessage("Logging In...");
    alert('login')
    setWallet("0x123");
    localStorage.setItem("wallet", "0x123")
    setMessage("");
  }

  function btnLogoutClick() {
    setMessage("Logging Out...");
    setWallet("");
    localStorage.removeItem("wallet");
    setMessage("");
  }

  function btnMintClick() {
    alert('Mint')
    setMessage("Minting...");
    setQuantity(1);
  }

  function onQuantityChange(evt: ChangeEvent<HTMLInputElement>) {
    const quantity = parseInt(evt.target.value);

    if (quantity > 5)
      setQuantity(5)
    else
      setQuantity(quantity);
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <h1>Mint Page</h1>
        <p>
          {
            !wallet
              ? <button id="btnLogin" onClick={btnLoginClick}>LogIn</button>
              : (
                <>
                  <a href={`${process.env.OPENSEA_URL}/${wallet}`}>
                    {wallet}
                  </a>
                  <button id="btnLogout" onClick={btnLogoutClick}>LogOut</button>
                </>
              )
          }
        </p>
        {
          wallet
            ? (
              <>
                <p>
                  <label htmlFor="quantity">
                    Quantity:
                    <input type="number" id="quantity" value={quantity} onChange={onQuantityChange} />
                  </label>
                </p>
                <p>
                  <button id="btnMint" onClick={btnMintClick}>Mint</button>
                </p>
              </>
            )
            : <></>
        }
        <p>
          {message}
        </p>
      </div>
    </main>
  );
}
