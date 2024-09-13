import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Lock", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const contract = await hre.ethers.getContractFactory("Multitoken");
    return { contract, owner, otherAccount };
  }

  describe("Multitoken", function () {
    it("Should ...", async function () {
      const { contract, owner, otherAccount } = await loadFixture(deployFixture);

      // expect(await lock.unlockTime()).to.equal(unlockTime);
    });

  });
});
