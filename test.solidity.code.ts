
const TestERC20 = `
   
    // SPDX-License-Identifier: MIT

    pragma solidity ^0.8.15;

    library SafeMath {
        function add(uint256 a, uint256 b) internal pure returns (uint256) {
            uint256 c = a + b;
            require(c >= a, "SafeMath: addition overflow");

            return c;
        }

        function sub(uint256 a, uint256 b) internal pure returns (uint256) {
            return sub(a, b, "SafeMath: subtraction overflow");
        }

        function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
            require(b <= a, errorMessage);
            uint256 c = a - b;

            return c;
        }

        function mul(uint256 a, uint256 b) internal pure returns (uint256) {
            if (a == 0) {
                return 0;
            }

            uint256 c = a * b;
            require(c / a == b, "SafeMath: multiplication overflow");

            return c;
        }

        function div(uint256 a, uint256 b) internal pure returns (uint256) {
            return div(a, b, "SafeMath: division by zero");
        }

        function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
            require(b > 0, errorMessage);
            uint256 c = a / b;
            // assert(a == b * c + a % b); // There is no case in which this doesn't hold

            return c;
        }

        function mod(uint256 a, uint256 b) internal pure returns (uint256) {
            return mod(a, b, "SafeMath: modulo by zero");
        }

        function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
            require(b != 0, errorMessage);
            return a % b;
        }
    }

    interface IERC20 {
        function transfer(address recipient, uint256 amount) external returns (bool);
        event Transfer(address indexed from, address indexed to, uint256 value);
    }

    contract ERC20Simple is IERC20 {
        using SafeMath for uint256;
        
        mapping (address => uint256) private _balances;

        uint256 public totalSupply;
        string public name;
        string public symbol;
        uint256 public decimals;

        constructor (string memory __name, string memory __symbol, uint256 __decimals, uint256 __maxSupply) {
            name = __name;
            symbol = __symbol;
            decimals = __decimals;
            _mint(msg.sender, __maxSupply.mul(10 ** decimals));
        }

        function balanceOf(address account) public view returns (uint256) {
            return _balances[account];
        }

        function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
            _transfer(msg.sender, recipient, amount);
            return true;
        }

        function _transfer(address sender, address recipient, uint256 amount) internal virtual {
            require(sender != address(0), "ERC20: transfer from the zero address");
            require(recipient != address(0), "ERC20: transfer to the zero address");

            _balances[sender] = _balances[sender].sub(amount, "ERC20: transfer amount exceeds balance");
            _balances[recipient] = _balances[recipient].add(amount);
            emit Transfer(sender, recipient, amount);
        }

        function _mint(address account, uint256 amount) internal virtual {
            require(account != address(0), "ERC20: mint to the zero address");

            totalSupply = totalSupply.add(amount);
            _balances[account] = _balances[account].add(amount);
            emit Transfer(address(0), account, amount);
        }
        
        receive() external payable {
            revert();
        }
    }
    `
export default TestERC20;