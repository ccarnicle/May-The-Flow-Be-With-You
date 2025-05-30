import { useCurrentFlowUser } from "@onflow/kit";
import { AppBar, Toolbar, Typography, Button, styled, Tooltip } from '@mui/material';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#0a0a0a',
  borderBottom: '2px solid #ff00ff',
  boxShadow: '0 0 20px #ff00ff',
  width: '480px',
  margin: '0 auto',
  borderRadius: '4px',
  [theme.breakpoints.down('md')]: {
    width: '100%',
    maxWidth: '480px',
  },
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontFamily: 'Orbitron, sans-serif',
  color: '#00ffff',
  flexGrow: 1,
}));

const WalletButton = styled(Button)(({ theme }) => ({
  fontFamily: 'Inter, sans-serif',
  borderColor: '#ff00ff',
  color: '#ff00ff',
  '&:hover': {
    borderColor: '#00ffff',
    color: '#00ffff',
  },
}));

const NavBar = () => {
  const { user, authenticate, unauthenticate } = useCurrentFlowUser();

  const handleWalletClick = () => {
    if (user.loggedIn) {
      unauthenticate();
    } else {
      authenticate();
    }
  };

  const formatAddress = (address: string | undefined) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <StyledAppBar position="static">
      <Toolbar>
        <StyledTypography variant="h6">
          Onchain Dice
        </StyledTypography>
        {user.loggedIn ? (
          <Tooltip title="Log Out" placement="bottom">
            <WalletButton 
              color="primary" 
              variant="outlined"
              onClick={handleWalletClick}
            >
              {formatAddress(user.addr)}
            </WalletButton>
          </Tooltip>
        ) : (
          <WalletButton 
            color="primary" 
            variant="outlined"
            onClick={handleWalletClick}
          >
            Connect Wallet
          </WalletButton>
        )}
      </Toolbar>
    </StyledAppBar>
  );
};

export default NavBar; 