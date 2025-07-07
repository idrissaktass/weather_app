import { CircularProgress, Grid, Typography } from "@mui/material"

const LoadingSpinner = () => {

    return(
        <Grid display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"} minHeight={"100%"} gap={"20px"}>
            <CircularProgress size={70}/>
            <Typography fontSize={"24px"} fontWeight={600}>Loading...</Typography>
        </Grid>
    )
}

export default LoadingSpinner;
