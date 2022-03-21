pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";


contract OnzeBar is ERC20("OnzeBar", "xOX"){
    using SafeMath for uint256;
    IERC20 public onze;

    constructor(IERC20 _onze) public {
        onze = _onze;
    }

    // Enter the bar. Pay some OXs. Earn some shares.
    function enter(uint256 _amount) public {
        uint256 totalOnze = onze.balanceOf(address(this));
        uint256 totalShares = totalSupply();
        if (totalShares == 0 || totalOnze == 0) {
            _mint(msg.sender, _amount);
        } else {
            uint256 what = _amount.mul(totalShares).div(totalOnze);
            _mint(msg.sender, what);
        }
        onze.transferFrom(msg.sender, address(this), _amount);
    }

    // Leave the bar. Claim back your OXs.
    function leave(uint256 _share) public {
        uint256 totalShares = totalSupply();
        uint256 what = _share.mul(onze.balanceOf(address(this))).div(totalShares);
        _burn(msg.sender, _share);
        onze.transfer(msg.sender, what);
    }
}