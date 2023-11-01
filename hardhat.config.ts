import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@truffle/dashboard-hardhat-plugin";
import 'solidity-coverage'
import "hardhat-preprocessor";
import * as fs from 'fs';

function getRemappings() {
  return fs
    .readFileSync("remappings.txt", "utf8")
    .split("\n")
    .filter(Boolean) // remove empty lines
    .map((line) => line.trim().split("="));
}



const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.18",
    settings: {
      evmVersion: "istanbul",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  preprocess: {
    eachLine: (hre) => ({
      transform: (line: string) => {
        if (line.match(/^\s*import /i)) {
          for (const [from, to] of getRemappings()) {
            if (line.includes(from)) {
              line = line.replace(from, to);
              break;
            }
          }
        }
        return line;
      },
    }),
  },
};

export default config;
