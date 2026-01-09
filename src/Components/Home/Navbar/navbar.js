// import React from "react";
// import { Link, NavLink } from "react-router-dom";
// import PropTypes from "prop-types";
// import AppBar from "@mui/material/AppBar";
// import Box from "@mui/material/Box";
// import Divider from "@mui/material/Divider";
// import Drawer from "@mui/material/Drawer";
// import IconButton from "@mui/material/IconButton";
// import List from "@mui/material/List";
// import ListItem from "@mui/material/ListItem";
// import ListItemButton from "@mui/material/ListItemButton";
// import ListItemText from "@mui/material/ListItemText";
// import MenuIcon from "@mui/icons-material/Menu";
// import Toolbar from "@mui/material/Toolbar";
// import Typography from "@mui/material/Typography";
// import Button from "@mui/material/Button";
// import { Container, useMediaQuery } from "@mui/material";
// import { useAuth } from "../../../providers/AuthProvider"; // Import your AuthProvider
// import Logo from "../../../images/Logo-Nav/logo.png";
// import "./navbar.css";

// const drawerWidth = 240;

// function Navbar(props) {
//   const { window } = props;
//   const [mobileOpen, setMobileOpen] = React.useState(false);
//   const { isLoggedIn, loggedOut } = useAuth(); // Use the AuthProvider to access login state

//   const handleDrawerToggle = () => {
//     setMobileOpen(!mobileOpen);
//   };

//   const handleLogout = () => {
//     loggedOut();
//     // Additional logout logic if needed
//   };

//   const navItems = [
//     { name: "முகப்பு", link: "/" },
//     { name: "வரலாறு", link: "/history" },
//     { name: "நூல்கள்", link: "/books" },
//     { name: "அணிகள்", link: "/teams" },
//     { name: "தொடர்புகள்", link: "/contact" },
//   ];

//   const drawer = (
//     <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
//       <Typography variant="h6" sx={{ my: 2 }} className="nav-Items">
//         <Link to="/" style={{ display: "flex", justifyContent: "center" }}>
//           <img src={Logo} alt="Logo" height={50} />
//         </Link>
//       </Typography>
//       <Divider />
//       <List>
//         {navItems.map((item) => (
//           <ListItem key={item.name} disablePadding>
//             <ListItemButton sx={{ textAlign: "center" }}>
//               <ListItemText>
//                 <Link to={item.link} className="nav-Items">
//                   {item.name}
//                 </Link>
//               </ListItemText>
//             </ListItemButton>
//           </ListItem>
//         ))}
//         {/* Conditional Rendering for Auth Links */}
//         {!isLoggedIn && (
//           <>
//             <ListItem disablePadding>
//               <ListItemButton sx={{ textAlign: "center" }}>
//                 <ListItemText>
//                   <Link to="/login" className="nav-Items">
//                     கணக்கு
//                   </Link>
//                 </ListItemText>
//               </ListItemButton>
//             </ListItem>
//             <ListItem disablePadding>
//               <ListItemButton sx={{ textAlign: "center" }}>
//                 <ListItemText>
//                   <Link to="/signup" className="nav-Items">
//                     கணக்கை உருவாக்கு
//                   </Link>
//                 </ListItemText>
//               </ListItemButton>
//             </ListItem>
//           </>
//         )}
//         {isLoggedIn && (
//           <ListItem disablePadding>
//             <ListItemButton sx={{ textAlign: "center" }} onClick={handleLogout}>
//               <ListItemText>
//                 <span className="nav-Items">Logout</span>
//               </ListItemText>
//             </ListItemButton>
//           </ListItem>
//         )}
//       </List>
//     </Box>
//   );

//   const container =
//     window !== undefined ? () => window().document.body : undefined;

//   const isXs = useMediaQuery("(max-width:600px)");

//   return (
//     <Box sx={{ display: "flex", height: "64px" }} className="navbar-container">
//       <AppBar component="nav" className="appBar">
//         <Container maxWidth="xl">
//           <Toolbar sx={{ height: "64px" }}>
//             <IconButton
//               color="inherit"
//               aria-label="open drawer"
//               edge="start"
//               onClick={handleDrawerToggle}
//               sx={{ mr: 2, display: { sm: "none" }, color: "#022345" }}
//             >
//               <MenuIcon />
//             </IconButton>
//             {isXs ? (
//               <Typography
//                 variant="h6"
//                 component="div"
//                 sx={{ flexGrow: 1, display: { xs: "block", sm: "block" } }}
//                 className="nav-Items"
//               >
//                 <p className="uni-name">தமிழ் இலக்கிய மன்றம்</p>
//               </Typography>
//             ) : (
//               <Typography
//                 variant="h6"
//                 component="div"
//                 sx={{ flexGrow: 1, display: { xs: "block", sm: "block" } }}
//                 className="nav-Items"
//               >
//                 <Link to="/" style={{ display: "flex", alignItems: "center" }}>
//                   <img
//                     src={Logo}
//                     alt="Logo"
//                     height={50}
//                     style={{ marginRight: "10px" }}
//                   />
//                   <p className="uni-name">
//                     மொறட்டுவைப் பல்கலைக்கழக தமிழ் இலக்கிய மன்றம்
//                   </p>
//                 </Link>
//               </Typography>
//             )}
//             <Box sx={{ display: { xs: "none", sm: "block" } }}>
//               {navItems.map((item) => (
//                 <NavLink
//                   key={item.name}
//                   to={item.link}
//                   className="nav-Items"
//                   activeClassName="active-nav-Item"
//                 >
//                   {item.name}
//                 </NavLink>
//               ))}
//               {/* Conditional Rendering for Auth Links */}
//               {!isLoggedIn && (
//                 <>
//                   <NavLink to="/login" className="nav-Items">
//                     கணக்கு
//                   </NavLink>
//                   <NavLink to="/signup" className="nav-Items">
//                     கணக்கை உருவாக்கு
//                   </NavLink>
//                 </>
//               )}
//               {isLoggedIn && (
//                 <Button onClick={handleLogout} className="nav-Items">
//                   Logout
//                 </Button>
//               )}
//             </Box>
//           </Toolbar>
//         </Container>
//       </AppBar>
//       <Box component="nav">
//         <Drawer
//           container={container}
//           variant="temporary"
//           open={mobileOpen}
//           onClose={handleDrawerToggle}
//           ModalProps={{
//             keepMounted: true, // Better open performance on mobile.
//           }}
//           sx={{
//             display: { xs: "block", sm: "none" },
//             "& .MuiDrawer-paper": {
//               boxSizing: "border-box",
//               width: drawerWidth,
//             },
//           }}
//         >
//           {drawer}
//         </Drawer>
//       </Box>
//       <Box component="main" sx={{ p: 3 }}>
//         <Toolbar />
//       </Box>
//     </Box>
//   );
// }

// Navbar.propTypes = {
//   window: PropTypes.func,
// };

// export default Navbar;
import React, { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Container } from "@mui/material";
import "./navbar.css";
import Logo from "../../../images/Logo-Nav/logo.png";
import { NavLink } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import Modal from "../../../Components/Modal";
import Login from "../../../Components/Login";
import Signup from "../../../Components/Signup";
import { useAuth } from "../../../providers/AuthProvider";

const drawerWidth = 240;

const navItems = [
  { name: "முகப்பு", link: "/" },
  { name: "வரலாறு", link: "/history" },
  { name: "நூல்கள்", link: "/books" },
  { name: "அணிகள்", link: "/teams" },
  { name: "தொடர்புகள்", link: "/contact" },
];

function Navbar(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showModal, setModal] = useState(undefined);
  const auth = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }} className="nav-Items">
        <Link to="/" style={{ display: "flex", justifyContent: "center" }}>
          <img src={Logo} alt="" height={50} />
        </Link>
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton sx={{ textAlign: "center" }}>
              <ListItemText>
                <Link to={item.link} className="nav-Items">
                  {item.name}
                </Link>
              </ListItemText>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  const isXs = useMediaQuery("(max-width:600px)");

  const openModal = (modalType) => {
    setModal(modalType);
  };

  const closeModal = () => {
    setModal(undefined);
  };

  return (
    <Box sx={{ display: "flex", height: "64px" }} className="navbar-container">
      <AppBar component="nav" className="appBar">
        <Container maxWidth="xl">
          <Toolbar sx={{ height: "64px" }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" }, color: "#022345" }}
            >
              <MenuIcon />
            </IconButton>
            {isXs ? (
              <Typography
                variant="h6"
                component="div"
                sx={{ flexGrow: 1, display: { xs: "block", sm: "block" } }}
                className="nav-Items"
              >
                <p className="uni-name">தமிழ் இலக்கிய மன்றம்</p>
              </Typography>
            ) : (
              <Typography
                variant="h6"
                component="div"
                sx={{ flexGrow: 1, display: { xs: "block", sm: "block" } }}
                className="nav-Items"
              >
                <Link to="/" style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={Logo}
                    alt=""
                    height={50}
                    style={{ marginRight: "10px" }}
                  />
                  <p className="uni-name">
                    மொறட்டுவைப் பல்கலைக்கழக தமிழ் இலக்கிய மன்றம்
                  </p>
                </Link>
              </Typography>
            )}
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.link}
                  className="nav-Items"
                  activeClassName="active-nav-Item"
                >
                  {item.name}
                </NavLink>
              ))}
              {/* {!auth.isLoggedIn && (
                <>
                  <Button
                    sx={{ backgroundColor: "#022345" }}
                    onClick={() => openModal("login")}
                  >
                    Login
                  </Button>
                  <Button
                    sx={{ backgroundColor: "#022345", color: "white" }}
                    onClick={() => openModal("signup")}
                    style={{ marginLeft: "3px" }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
              {auth.isLoggedIn && (
                <Button
                  sx={{ backgroundColor: "#022345", color: "white" }}
                  onClick={() => auth.loggedOut()}
                >
                  Logout
                </Button>
              )} */}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Box component="nav">
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ p: 3 }}>
        <Toolbar />
      </Box>
      {/* <Modal isOpen={showModal === "login"} onClose={closeModal}>
        <Login changeModal={openModal} />
      </Modal>
      <Modal isOpen={showModal === "signup"} onClose={closeModal}>
        <Signup changeModal={openModal} />
      </Modal> */}
    </Box>
  );
}

Navbar.propTypes = {
  window: PropTypes.func,
};

export default Navbar;
