import { AppBar, Toolbar, Typography } from "@mui/material";
import React from "react";
import logo from "../data/navbar_logo.png"
import { Box, width } from "@mui/system";

const Navbar = () => {
    
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <AppBar sx={{ display: "flex", alignItems: "center", backgroundColor: "#296573" }}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", width: { xs: "90%", sm: "80%" } }}>
                <Typography fontSize={{ xs: "20px", sm: "24px" }} fontWeight={"700"} onClick={handleRefresh} sx={{ cursor: "pointer" }}>
                <Box component="img" src={logo} sx={{ width: "70px" , paddingTop:"2px"}} />
                </Typography>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
