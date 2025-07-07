import React, { useState, useEffect } from 'react';
import { Box, Grid2, Input, InputAdornment, Typography, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, InputLabel, MenuItem, FormControl, Select,  
    useMediaQuery, useTheme } from "@mui/material";
import { Search, Clear, AcUnitOutlined, ThunderstormOutlined, CloudOutlined, WbSunnyOutlined } from '@mui/icons-material';
import MainImage from "../data/mainImage.png";
import { fetchData } from '../api/api';
import LoadingSpinner from './LoadingSpinner';
import UnvalidImage from "../data/forUnvalid.png";
import Carousel from 'react-material-ui-carousel'
import AnkaraClear from "../data/ankaraClear.jpg";
import AnkaraCloud from "../data/ankaraCloud.jpg";
import AnkaraRain from "../data/ankaraRain.jpg";
import AnkaraSnow from "../data/ankaraSnow.jpg";
import IzmirClear from "../data/izmirClear.jpg";
import IzmirCloud from "../data/izmirCloud.jpg";
import IzmirRain from "../data/izmirRain.jpg";
import IstabulClear from "../data/istanbulClear.jpg";
import IstanbulCloud from "../data/istanbulCloud.jpg";
import IstanbulRain from "../data/istanbulRain.jpg";
import IstanbulSnow from "../data/istanbulSnow.jpg";
import Snowy from "../data/snowy.jpg";
import Rainy from "../data/rainy.jpg";
import Sunny from "../data/sunny.jpg";
import PartiallyCloud from "../data/partiallyCloudy.jpg";
import { LineChart, areaElementClasses  } from '@mui/x-charts/LineChart';
import PartiallyCloudy from "../data/weather.gif"
import Cloudy from "../data/cloudy.gif"
import SunnyIcon from "../data/sunny.gif"
import RainyIcon from "../data/rainy.gif"
import Storm from "../data/storm.gif"
import Snow from "../data/snow.gif"
import Humidity from "../data/humidity.png"
import Overcast from "../data/overcast.gif"
import SnowyNight from "../data/snowynight.gif"
import CloudyNight from "../data/cloudynight.gif"
import RainyNight from "../data/rainynight.gif"
import ClearNight from "../data/clearnight.gif"

const cache = {};

const MainScreen = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [weatherData, setWeatherData] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedDay, setSelectedDay] = useState(0);
    const [istanbul, setIstanbul] = useState([]);
    const [izmir, setIzmir] = useState([]);
    const [Ankara, setAnkara] = useState([]);
    const [isCity, setIsCity] = useState(false);
    const [current, setCurrent] = useState("");
    const [xAxisData, setXAxisData] = useState([]);
    const [seriesData, setSeriesData] = useState([]);
    const [allHours, setAllHours ] = useState([]);
    const [filter, setFilter] = useState('tempmax');
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.only('xs'));
    const isSm = useMediaQuery(theme.breakpoints.only('sm'));
    const isMd = useMediaQuery(theme.breakpoints.only('md'));
    const isLg = useMediaQuery(theme.breakpoints.only('lg'));
    const isXl = useMediaQuery(theme.breakpoints.only('xl'));

    const normalizeString = (str) => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    const handleFilter = (event) => {
        setFilter(event.target.value);
    };   

    const fetchCityData = async () => {
        setLoading(true);
        console.log('Cache status before fetching:', cache);

        // Check if the data for all cities is already in cache
        if (cache["Istanbul"] && cache["Ankara"] && cache["Izmir"]) {
            console.log('Using cached data');

            setIstanbul(cache["Istanbul"]);
            setAnkara(cache["Ankara"]);
            setIzmir(cache["Izmir"]);
            setLoading(false);
            return;
        }
    
        try {
            const cities = ["Istanbul", "Ankara", "Izmir"];
            const newCache = {}; // Object to store data fetched in this call
    
            for (const city of cities) {
                // If city data is already cached, skip the fetch
                if (!cache[city]) {
                    console.log(`Fetching data for ${city}`);
                    const result = await fetchData(city);
                    if (result && result.address) {
                        const normalizedCityName = normalizeString(result.address);
                        const dataToCache = result.days.slice(0, 1); // Assuming you want only the first day
    
                        if (normalizedCityName === normalizeString("istanbul")) {
                            setIstanbul(dataToCache);
                        } else if (normalizedCityName === normalizeString("ankara")) {
                            setAnkara(dataToCache);
                        } else if (normalizedCityName === normalizeString("izmir")) {
                            setIzmir(dataToCache);
                        }
                        
                        // Update the cache with the newly fetched data
                        newCache[city] = dataToCache;
                    }
                } else {
                    // If data is in cache, use it
                    console.log(`Using cached data for ${city}`);
                    const cityData = cache[city];
                    if (city === "Istanbul") setIstanbul(cityData);
                    if (city === "Ankara") setAnkara(cityData);
                    if (city === "Izmir") setIzmir(cityData);
                }
            }
    
            // Update the global cache with the data fetched in this call
            Object.assign(cache, newCache);
    
            // Update weatherData with cached data
            setWeatherData({ Istanbul: cache["Istanbul"], Ankara: cache["Ankara"], Izmir: cache["Izmir"] });
    
        } catch (error) {
            console.error('Error fetching city data:', error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchCityData();
    }, []);

    const handleSearch = async (city = null) => {
        const term = city || searchTerm;
        if (!term) return;

        console.log("handlesearch");
        setLoading(true);

        const normalizedSearchTerm = normalizeString(term);

        if (cache[normalizedSearchTerm]) {
            console.log('Using cached data');
            setWeatherData(cache[normalizedSearchTerm]);
            setSelectedCity(term);
            setLoading(false);
            return;
        }

        try {
            const result = await fetchData(term);

            if (result && normalizeString(result.address) === normalizedSearchTerm) {
                const dataToCache = result.days.slice(0, 5);
                cache[normalizedSearchTerm] = dataToCache;

                setWeatherData(dataToCache);
                setCurrent(result.currentConditions);
                setSelectedCity(result.address);
                setIsCity(true);
            } else {
                setWeatherData(null);
                setSelectedCity(term);
            }
        } catch (error) {
            console.error('Error fetching city data:', error);
        } finally {
            setLoading(false);
        }
    };

    const groupByHours = (hours, chunkSize) => {
        const result = [];
        for (let i = 0; i < hours?.length; i += chunkSize) {
            result.push(hours?.slice(i, i + chunkSize));
        }
        return result;
    };

    const hours = weatherData[selectedDay]?.hours;
    const hourlyGroups = groupByHours(hours, isXs ? 3 : 6);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSelectedCity(null)
        setWeatherData([]);
        setIsCity(false);
    };
    

    const handleRowClick = (index) => {
        setSelectedDay(index);
    };

    const getDayName = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };

    const fahrenheitToCelsius = (fahrenheit) => {
        return Math.round((fahrenheit - 32) * 5 / 9);
    };

    const formatDayMonth = (datetime) => {
        const date = new Date(datetime);
        const day = date.getDate();
        const month = date.getMonth() + 1; // Months are 0-based
        return `${day}, ${month < 10 ? `0${month}` : month}`;
    };

        const getWeatherIcon = (conditions) => {

        const desc = conditions.toLowerCase();

        if (desc.includes('snow')) {
            // return <AcUnitOutlined sx={{color:'#296573'}}/>
            return <Box component="img" src={Snow} width={{xs:"50%", sm:"80%", md:"60%"}} height={"auto"} style={{backgroundColor:"transparent"}}/>
        }
        if (desc.includes('rain') && !desc.includes('snow')) {
            // return <ThunderstormOutlined sx={{color:'#296573'}}/>
            return <Box component="img"  src={RainyIcon} width={{xs:"50%", sm:"80%", md:"60%"}} height={"auto"} style={{backgroundColor:"transparent"}}/>
        }
        if (desc.includes('cloud') && !desc.includes('rain') && !desc.includes('snow') && !desc.includes('partially')) {
            // return <CloudOutlined sx={{color:'#296573'}}/>
            return <Box component="img"  src={Cloudy} width={{xs:"50%", sm:"80%", md:"60%"}} height={"auto"} style={{backgroundColor:"transparent"}}/>
        }
        if (desc.includes('clear')) {
            // return <WbSunnyOutlined sx={{color:'#296573'}}/>
            return <Box component="img"  src={SunnyIcon} width={{xs:"50%", sm:"80%", md:"60%"}} height={"auto"} style={{backgroundColor:"transparent"}}/>
        }
        if (desc.includes('partially') && !desc.includes('rain')) {
            // return <Box component="img" src='../data/weather.gif' sx={{width:'100%', height:"auto"}}/>
            return <Box component="img"  src={PartiallyCloudy} width={{xs:"50%", sm:"80%", md:"60%"}} height={"auto"} style={{backgroundColor:"transparent"}}/>
        }
    };

    const isNightTime = (hour) => {
        const hourString = hour.split(':')[0];
        const hourInt = parseInt(hourString, 10);
        return hourInt >= 20 || hourInt < 6;
    };

    const getWeatherIcon2 = (conditions, hour) => {
        const desc = conditions.toLowerCase();
        const night = isNightTime(hour?.datetime);
        console.log("night", night, hour)
        if (desc.includes('snow')) {
            return night 
                ? <Box component="img" src={SnowyNight} width={{xs:"50%", sm:"80%", md:"60%"}} height={"auto"} style={{backgroundColor:"transparent"}}/> 
                : <Box component="img" src={Snow} width={{xs:"50%", sm:"80%", md:"60%"}} height={"auto"} style={{backgroundColor:"transparent"}}/>;
        }
        if (desc.includes('rain') && !desc.includes('snow')) {
            console.log("rain", night)
            return night 
                ? <Box component="img" src={RainyNight} width={{xs:"50%", sm:"80%", md:"60%"}} height={"auto"} style={{backgroundColor:"transparent"}}/>
                : <Box component="img" src={RainyIcon} width={{xs:"50%", sm:"80%", md:"60%"}} height={"auto"} style={{backgroundColor:"transparent"}}/>;
        }
        if (desc.includes('overcast') || desc.includes('cloud') && !desc.includes('rain') && !desc.includes('snow') && !desc.includes('partially')) {
            console.log("cloud", night)
            return <Box component="img" src={Overcast} width={{xs:"50%", sm:"80%", md:"60%"}} height={"auto"} style={{backgroundColor:"transparent"}}/>;
        }
        if (desc.includes('clear')) {
            console.log("nightttt", night)
            return night
                ? <Box component="img" src={ClearNight} width={{xs:"50%", sm:"80%", md:"60%"}} height={"auto"} style={{backgroundColor:"transparent"}}/>
                : <Box component="img" src={SunnyIcon} width={{xs:"50%", sm:"80%", md:"60%"}} height={"auto"} style={{backgroundColor:"transparent"}}/>;
        }
        if (desc.includes('overcast')) {
            return <Box component="img" src={Overcast} width={{xs:"50%", sm:"80%", md:"60%"}} height={"auto"} style={{backgroundColor:"transparent"}}/>;
        }
        if (desc.includes('partially') && !desc.includes('rain')) {
            return night 
                ? <Box component="img" src={CloudyNight} width={{xs:"50%", sm:"80%", md:"60%"}} height={"auto"} style={{backgroundColor:"transparent"}}/>
                : <Box component="img" src={PartiallyCloudy} width={{xs:"50%", sm:"80%", md:"60%"}} height={"auto"} style={{backgroundColor:"transparent"}}/>;
        }
        return null;
    };

    const getCityImages = (city, conditions) => {
        const desc = conditions.toLowerCase();
        let imageSrc = null;
    
        if (desc.includes('snow')) {
            imageSrc = city === "ankara" ? AnkaraSnow : city === "izmir" ? IstanbulSnow : IstanbulSnow;
        } else if (desc.includes('rain')) {
            imageSrc = city === "ankara" ? AnkaraRain : city === "izmir" ? IzmirRain : IstanbulRain;
        } else if (desc.includes('cloud')) {
            imageSrc = city === "ankara" ? AnkaraCloud : city === "izmir" ? IzmirCloud : IstanbulCloud;
        } else if (desc.includes('clear')) {
            imageSrc = city === "ankara" ? AnkaraClear : city === "izmir" ? IzmirClear : IstabulClear;
        }
    
        return (
            <Box
                sx={{
                    position: 'relative',
                    height: '300px',
                    width: '100%',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {imageSrc && (
                    <img
                        src={imageSrc}
                        alt="Weather"
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            objectFit: 'cover',
                            height: '100%',
                            width: 'auto',
                            borderRadius:"10px"
                        }}
                    />
                )}
            </Box>
        );
    }; 

        const getWeatherImages = (conditions) => {
        const desc = conditions.toLowerCase();
        const imageSrc = desc.includes('snow') ? Snowy :
                         desc.includes('rain') ? Rainy :
                         desc.includes('clear') ? Sunny :
                         desc === "partially cloudy" ? PartiallyCloud:
                         null; 
        return (
            <Box
                sx={{ 
                    position: 'relative', 
                    height: '250px', 
                    width: '100%', 
                    overflow: 'hidden', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                }}
            >
                {imageSrc && (
                    <img 
                        src={imageSrc} 
                        alt="Weather" 
                        style={{ 
                            position: 'absolute', 
                            top: '50%', 
                            left: '50%', 
                            transform: 'translate(-50%, -50%)', 
                            objectFit: 'cover', 
                            height: '100%', 
                            width: 'auto' ,
                            borderRadius:"10px"
                        }} 
                    />
                )}
            </Box>
        );
    };

    const getWeatherAdvice = (conditions, temp) => {
        const celsiusTemp = fahrenheitToCelsius(temp);
        
        if ((conditions.includes("cloudy") || conditions.includes("Clear")) && celsiusTemp > 20) {
            return "Ideal day for a picnic!";
        } else if (conditions.includes("Rain") || conditions.includes("Overcast")) {
            return "It may rain, don't forget to take your umbrella or raincoat when you go out";
        } else if (conditions.includes("Snow")) {
            return "It may snow, cold weather awaits you, don't forget to drink something warm!";
        } else if (celsiusTemp < 0) {
            return "Don't you dare freeze!";
        } else if (celsiusTemp > 40) {
            return "Between 11.00-16.00, think twice before going out and don't shoot at the sun!";
        } else {
            return "Have a great day!";
        }
    };

    const chunkArray = (array, chunkSize) => {
        let result = [];
        for (let i = 0; i < array.length; i += chunkSize) {
          result.push(array.slice(i, i + chunkSize));
        }
        return result;
      }
      
      const getNextThreeHours = (hourlyGroups) => {
        const currentHour = new Date().getHours(); // Get the current hour
        const flatHours = hourlyGroups.flat(); // Flatten the nested array if hourlyGroups is grouped
        const nextThreeHours = flatHours.filter(hour => {
            const hourNumber = parseInt(hour.datetime.split(':')[0]);
            return hourNumber >= currentHour;
        }).slice(0, 3); // Get the first 3 hours starting from the current hour
        return nextThreeHours;
    };      
    const nextThreeHours = getNextThreeHours(hourlyGroups);
    console.log("weatherData",weatherData)
    return (
        <>
        <Grid2 container justifyContent={'center'} pt={15} gap={2} alignItems={selectedCity && {xs:"center", lg:"start"}} direction={selectedCity ? {xs:"column-reverse", lg:"row"}  : "row-reverse"}>
            {loading ?( <LoadingSpinner/>) :(
                <>
                {selectedCity && (
                    <Grid2 container size={{xs:11.8, sm:11, lg:8, xl:6}} display={'flex'} flexDirection={'column'} gap={2} mb={2}>
                        <Typography width={{xs:"95%", sm:"fit-content"}} textAlign={{xs:"center", sm:'left'}} color='#071437' fontSize={{xs:"24px", sm:"28px", md:"32px"}} fontWeight={"500"}
                        bgcolor={"#ffffffbf"} padding={"5px"} borderRadius={"12px"} alignSelf={{xs:"center", sm:"unset"}}>
                            Weather Forecast for <span style={{ textTransform: 'capitalize', color:"#296573" }}>{selectedCity}</span>
                        </Typography>      
                        <Grid2 container size={12} borderRadius={"12px"} height={"fit-content"} justifyContent={'center'} display={'flex'} bgcolor={"#ffffffbf"} sx={{ borderLeft: "1px solid #DBDFE9", 
                            textAlign: "center", boxShadow:"0px 5px 10px rgba(0, 0, 0, 0.03)" }}>                      
                            {weatherData?.map((day, index) => (
                                <Grid2 key={index} size={{xs:12, sm:6, md:2.4}} borderRight={index === 4 ? "none" : "1px solid #DBDFE9"}
                                padding={{xs:"10px 25px 10px 10px",sm:"20px", xl: "40px" }}  onClick={() => handleRowClick(index)}
                                sx={{
                                    cursor: 'pointer',
                                    backgroundColor: selectedDay === index ? '#E0F7FA !important' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: '#fcfcfc8a',
                                    },
                                    ...(index === 0 && { // Special hover effect only for the first item
                                        borderRadius: '12px 0px 0px 12px',
                                        '&:hover': {
                                            backgroundColor: '#fcfcfc8a',
                                            borderRadius: '12px 0px 0px 12px', // Keep borderRadius on hover only for the first item
                                        }
                                    }),
                                    ...(index === 4 && { // Special hover effect only for the first item
                                        borderRadius: '0px 12px 12px 0px',
                                        '&:hover': {
                                            backgroundColor: '#fcfcfc8a',
                                            borderRadius: '0px 12px 12px 0px', // Keep borderRadius on hover only for the first item
                                        }
                                    })
                                }}>
                                    <Box
                                        display="flex"
                                        flexDirection={{ xs: 'row', sm: 'column' }} // Row layout for xs, column for larger sizes
                                        alignItems="center"
                                        justifyContent={"center"}
                                    >
                                        <Box display={'flex'} flexDirection={{xs:"row-reverse", md:"column-reverse"}} alignItems={'center'}>
                                            <Box
                                                display="flex"
                                                flexDirection="column"
                                                alignItems={{ xs: 'flex-start', sm: 'center' }} // Align items differently for xs
                                            >
                                                <Box display="flex" flexDirection={'column'} alignItems="center">
                                                    {getWeatherIcon(day.conditions)}
                                                    <Typography
                                                        color='#296573'
                                                        fontWeight={"600"}
                                                        fontSize={{ xs: "24px", sm: "32px" }}
                                                        ml={1} // Add margin left for spacing
                                                    >
                                                        {fahrenheitToCelsius(day.tempmax)} °C
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box width={{sm:"50%", md:"unset"}}>
                                                <Typography color='#296573' fontWeight={"600"} fontSize={{ xs: "18px", sm: "22px" }}>
                                                    {getDayName(day.datetime)}
                                                </Typography>
                                                <Typography color='lightslategray' fontWeight={"400"} fontSize={{ xs: "14px", sm: "16px" }}>
                                                    {formatDayMonth(day.datetime)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box width={"min-content"}>
                                            <Typography mt={1} display={'flex'} alignItems={"center"} color='lightslategray' gap={1} justifyContent={'center'}
                                                fontWeight={"400"} fontSize={{ xs: "16px", sm: "18px" }}
                                            >
                                                <Box component="img" src={Humidity} width={{ xs: "40%", md: "15%" }} height={"auto"} /> {day.humidity}%
                                            </Typography>
                                            <Typography mt={2} color='lightslategray' fontWeight={"400"} fontSize={{ xs: "14px", sm: "16px" }}>
                                                {day.conditions}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid2>
                            ))}
                        </Grid2>
                        <Grid2 size={{xs:12}}>
                            <Grid2 padding={"5px 0px 5px 10px"} boxShadow={"0px 5px 10px rgba(0, 0, 0, 0.03)"} borderLeft={"1px solid #DBDFE9"} bgcolor={"#ffffffbf"}
                            borderRight={"1px solid #DBDFE9"} borderTop={"1px solid #DBDFE9"} borderRadius={"12px 12px 0px 0px"}>
                                <Typography color='#296573' fontSize={{xs:"16px", sm:"18px"}} fontWeight={600} display={'flex'} gap={"5px"}>
                                    {getDayName(weatherData[selectedDay].datetime)}
                                    <Typography color='lightslategray' fontWeight={"400"} fontSize={{xs:"16px", sm:"18px"}} >
                                        {formatDayMonth(weatherData[selectedDay].datetime)}
                                    </Typography>
                                </Typography>
                            </Grid2>
                            <Carousel sx={{width:"100%"}}>
                            {hourlyGroups.map((group, groupIndex) => (
                                <Grid2
                                key={groupIndex}
                                container
                                display="flex"
                                justifyContent={'center'}
                                bgcolor={"#ffffffbf"}
                                sx={{
                                    borderRadius: "0px 0px 12px 12px",
                                    border: "1px solid #DBDFE9",
                                    textAlign: "center",
                                    boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.03)",
                                }}
                                >
                                {group.map((day, index) => (
                                    <Grid2
                                    key={index}
                                    size={{ xs: 12 / group.length, sm: 3, md: 2 }}
                                    borderRight={index === group.length - 1 ? "none" : "1px solid #DBDFE9"}
                                    padding={{ xs: "20px", xl: "40px" }}
                                    >
                                    <Box mb={2}>
                                        <Typography color="#296573" fontWeight={"500"} fontSize={{ xs: "14px", sm: "18px" }}>
                                            {day.datetime.split(':')[0]}:00
                                        </Typography>
                                    </Box>
                                    <Box>
                                        {/* Replace this with your icon rendering logic */}
                                        {getWeatherIcon2(day.conditions, day)}
                                        <Typography color="#296573" fontWeight={"500"} fontSize={{ xs: "18px", sm: "24px" }}>
                                        {fahrenheitToCelsius(day.temp)} °C
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography
                                        mt={1}
                                        display={"flex"}
                                        alignItems={"center"}
                                        color="lightslategray"
                                        gap={1}
                                        justifyContent={"center"}
                                        fontWeight={"400"}
                                        fontSize={{ xs: "12px", sm: "14px" }}
                                        >
                                        <img src={Humidity} width={"15%"} height={"auto"} /> {day.humidity}%
                                        </Typography>
                                        <Typography mt={2} color="lightslategray" fontWeight={"400"} fontSize={{ xs: "10px", sm: "12px" }}>
                                        {day.conditions}
                                        </Typography>
                                    </Box>
                                    </Grid2>
                                ))}
                                </Grid2>
                            ))}
                            </Carousel>
                        </Grid2> 
                    </Grid2>
                )}
                    <Grid2
                        size={{
                            xs: 11,
                            sm: selectedCity ? 11 : 8,
                            md: selectedCity ? 8 : 4.5,
                            lg: 3,
                            xl: 3
                        }}
                        display={"flex"}
                        flexDirection={"column"}
                        gap={4}
                    >                    
                        <Input fullWidth disableUnderline placeholder="Search City"
                            sx={{ border: "1px solid #DBDFE9", borderRadius: "10px", padding: {xs:"5px", sm:"14px"}, backgroundColor:"#ffffffbf",
                                fontSize: {xs:"18px", sm:"20px"}, boxShadow:"0px 5px 10px rgba(0, 0, 0, 0.03)"}}
                            startAdornment={
                                searchTerm && (
                                    <InputAdornment position="start">
                                        <IconButton onClick={clearSearch}>
                                            <Clear />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton onClick={handleSearch}>
                                        <Search />
                                    </IconButton>
                                </InputAdornment>
                            } value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={handleKeyDown}
                        />
                        {selectedCity && weatherData ? (
                            <Box width={{xs:"100%", sm:"unset"}} alignSelf={{xs:"center", sm:"unset"}} bgcolor={"#ffffffbf"} sx={{ borderRadius: "12px", border: "1px solid #DBDFE9", padding: { xs: "10px", sm:"20px"}, alignItems:"center",
                                textAlign: "center", boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.03)" }} display={{xs:"unset", sm:"flex", lg:"unset"}}>
                            {/* Existing weather details */}
                            <Box display="flex" alignItems="center" flexDirection={'column'} justifyContent={"center"} gap={"5px"} mt={1} width={"100%"}>
                                {selectedDay !== 0 ? getWeatherImages(weatherData[selectedDay].conditions) : getWeatherImages(current.conditions)}
                                <Typography color="#296573" fontSize={{ xs: "16px", sm: "18px" }} fontWeight={"400"} sx={{display:"flex", alignItems:"center", justifyContent:"center"}}>
                                    {selectedDay !== 0 ? weatherData[selectedDay].conditions : current.conditions}
                                </Typography>
                            </Box>
                            <Box>
                                <Box display={'flex'} flexDirection={'column'} gap={"5px"}>
                                    <Typography color="#296573" fontSize={"56px"} fontWeight={"700"}>
                                        {selectedDay !== 0 ? fahrenheitToCelsius(weatherData[selectedDay].tempmax) : fahrenheitToCelsius(current.temp)} °C
                                    </Typography>
                                    <Box display={'flex'} flexDirection={'column'} gap={"10px"}>
                                        <Typography color="#313131" fontSize={"32px"} fontWeight={"700"} sx={{ textTransform: 'capitalize' }}>
                                            {selectedCity}
                                        </Typography>
                                        <Typography color="#313131" fontSize={{ xs: "14px", sm: "16px" }} fontWeight={"400"}>
                                            {formatDate(weatherData[selectedDay].datetime)}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Hourly forecast carousel */}
                                <Grid2 mt={{xs:0, lg:2}} height={"fit-content"} display={'flex'} justifyContent={'center'}>
                                {nextThreeHours.map((hour, i) => (
                                    <Grid2 item key={i} size={{xs:"2", sm:"3"}} display={'flex'} justifyContent={'center'}  height={"fit-content"}>
                                        <Box sx={{ minWidth: "100px", textAlign: "center" }}>
                                            <Typography fontSize="14px">{hour.datetime.split(':')[0]}:00</Typography> {/* Show the hour */}
                                            <Typography fontSize="16px" fontWeight="700">{fahrenheitToCelsius(hour.temp)}°C</Typography> {/* Show the temperature */}
                                            <Typography fontSize="12px" color="gray" display={'flex'} justifyContent={'center'} alignItems={'center'}>
                                                <Typography width={"35%"} mt={1}>
                                                    {getWeatherIcon2(hour.conditions, hour)}
                                                </Typography>
                                                {hour.conditions}
                                            </Typography> {/* Show conditions */}
                                        </Box>
                                    </Grid2>
                                ))}
                                </Grid2>

                                <Box display="flex" alignItems="center" justifyContent={"center"} gap={"5px"} mt={1}>
                                    <Typography color="#296573" fontSize={{ xs: "16px", sm: "18px" }} fontWeight={"400"}>
                                        {getWeatherAdvice(selectedDay !== 0 ? weatherData[selectedDay].conditions : current.conditions, selectedDay !== 0 ? weatherData[selectedDay].tempmax : current.temp)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        ) : !selectedCity && isCity ? (
                            <Box bgcolor={"#ffffffbf"} sx={{ borderRadius: "12px", border: "1px solid #DBDFE9", padding: { xs: "20px", lg: "40px" }, textAlign: "center", boxShadow:"0px 5px 10px rgba(0, 0, 0, 0.03)" }}>
                                <Typography color="#313131" fontSize={{ xs: "28px", md: "32px" }} fontWeight={"700"}>Does not Exist</Typography>
                                <Typography color="#313131" fontSize={{xs:"14px", sm:"16px"}} fontWeight={"400"}>
                                    Type a valid city name to get weekly forecast data.
                                </Typography>
                            </Box>
                        ) : !selectedCity ? (
                            <Box bgcolor={"#ffffffbf"} sx={{ borderRadius: "12px", border: "1px solid #DBDFE9", padding: { xs: "20px", lg: "40px" }, textAlign: "center", boxShadow:"0px 5px 10px rgba(0, 0, 0, 0.03)" }}>
                                <Typography color="#313131" fontSize={{ xs: "28px", md: "32px" }} fontWeight={"700"}>Select a City</Typography>
                                <Typography color="#313131" fontSize={{xs:"14px", sm:"16px"}} fontWeight={"400"}>
                                    Search and select a city to see results. Try typing the first letters of the city you want.
                                </Typography>
                            </Box>
                        ) : null}
                </Grid2>
                    <Grid2 size={{ xs: 11.2, sm: 9, md: 6.5, lg: 4.5, xl: 4 }}>
                        {!selectedCity && (
                            <Carousel>
                                <Box onClick={() => {handleSearch("ankara"); setSearchTerm("ankara")}} textAlign={'center'} 
                                    sx={{backgroundColor:"#ffffffbf", padding:"40px", cursor:"pointer",
                                    boxShadow:"0px 5px 10px rgba(0, 0, 0, 0.03)", borderRadius: "10px"}}>
                                    <Box display={'flex'} flexDirection={'column'} gap={"5px"} justifyContent={'center'} alignItems={'center'} >
                                        {Ankara.length > 0 && getCityImages("ankara", Ankara[0].conditions)}
                                        <Typography color="#296573" fontSize={ "56px" } fontWeight={"700"}>{Ankara.length > 0 ? `${fahrenheitToCelsius(Ankara[0].tempmax)} °C` : 'No data'} </Typography>
                                        <Box display={'flex'} flexDirection={'column'} gap={"10px"}>
                                            <Typography color="#313131" fontSize={"32px"} fontWeight={"700"} sx={{ textTransform: 'capitalize' }}>
                                                Ankara
                                            </Typography>
                                            <Typography color="#313131" fontSize={{xs:"14px", sm:"16px"}} fontWeight={"400"}>
                                                {Ankara.length > 0 && formatDate(Ankara[0].datetime)}
                                            </Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center" justifyContent={"center"}>
                                            <Box width={"20%"}>
                                                {Ankara.length > 0 && getWeatherIcon(Ankara[0].conditions)}
                                            </Box>
                                            <Typography color="#296573" fontSize={{xs:"16px", sm:"18px"}} fontWeight={"400"}>
                                            {Ankara.length > 0 && Ankara[0].conditions}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box onClick={() => {handleSearch("istanbul"); setSearchTerm("istanbul")}} textAlign={'center'} sx={{backgroundColor:"#ffffffbf", 
                                    padding:"40px", boxShadow:"0px 5px 10px rgba(0, 0, 0, 0.03)", borderRadius: "10px", cursor:"pointer"}}>
                                    <Box display={'flex'} flexDirection={'column'} gap={"5px"} justifyContent={'center'} alignItems={'center'}>
                                        {istanbul.length > 0 && getCityImages("istanbul", istanbul[0].conditions)}
                                        <Typography color="#296573" fontSize={ "56px" } fontWeight={"700"}> {istanbul.length > 0 ? `${fahrenheitToCelsius(istanbul[0].tempmax)} °C` : 'No data'}</Typography>
                                        <Box display={'flex'} flexDirection={'column'} gap={"10px"}>
                                            <Typography color="#313131" fontSize={"32px"} fontWeight={"700"} sx={{ textTransform: 'capitalize' }}>
                                                İstanbul
                                            </Typography>
                                            <Typography color="#313131" fontSize={{xs:"14px", sm:"16px"}} fontWeight={"400"}>
                                                {istanbul.length > 0 && formatDate(istanbul[0].datetime)}
                                            </Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center" justifyContent={"center"}>
                                            <Typography width={"20%"}>
                                                {istanbul.length > 0 && getWeatherIcon(istanbul[0].conditions)}
                                            </Typography>
                                            <Typography color="#296573" fontSize={{xs:"16px", sm:"18px"}} fontWeight={"400"}>
                                            {istanbul.length > 0 && istanbul[0].conditions}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box onClick={() => {handleSearch("izmir"); setSearchTerm("izmir")}} textAlign={'center'} sx={{backgroundColor:"#ffffffbf", 
                                    padding:"40px", boxShadow:"0px 5px 10px rgba(0, 0, 0, 0.03)", borderRadius: "10px", cursor:"pointer"}}>
                                    <Box display={'flex'} flexDirection={'column'} gap={"5px"} justifyContent={'center'} alignItems={'center'}>
                                        {izmir.length > 0 && getCityImages("izmir", izmir[0].conditions)}
                                        <Typography color="#296573" fontSize={ "56px" } fontWeight={"700"}>{izmir.length > 0 ? `${fahrenheitToCelsius(izmir[0].tempmax)} °C` : 'No data'} </Typography>
                                        <Box display={'flex'} flexDirection={'column'} gap={"10px"}>
                                            <Typography color="#313131" fontSize={"32px"} fontWeight={"700"} sx={{ textTransform: 'capitalize' }}>
                                                İzmir
                                            </Typography>
                                            <Typography color="#313131" fontSize={{xs:"14px", sm:"16px"}} fontWeight={"400"}>
                                                {izmir.length > 0 && formatDate(izmir[0].datetime)}
                                            </Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center" justifyContent={"center"}>
                                            <Typography width={"20%"}>
                                                {izmir.length > 0 && getWeatherIcon(izmir[0].conditions)}
                                            </Typography>
                                            <Typography color="#296573" fontSize={{xs:"16px", sm:"18px"}} fontWeight={"400"}>
                                            {izmir.length > 0 && izmir[0].conditions}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Carousel>
                        )}
                    </Grid2>
                </>
            )}
        </Grid2>
        {selectedCity && (
                    <Grid2 container mt={2} justifyContent={"center"} pb={4}>
                        <Grid2 size={{xs:11.8, sm:11, md:9, lg:8, xl:7}} bgcolor={"#ffffffbf"} sx={{ borderRadius: "12px", border: "1px solid #DBDFE9",
                            textAlign: "center", boxShadow:"0px 5px 10px rgba(0, 0, 0, 0.03)" }}>
                            <Grid2 marginInline={"10px"} marginTop={"10px"}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Filter</InputLabel>
                                    <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={filter}
                                    label="Filter"
                                    onChange={handleFilter}
                                    >
                                    <MenuItem value="tempmax">
                                        <Typography fontSize={{ xs: "18px", sm: "20px" }} fontWeight="600" color="#296573">
                                            Temperature Trend
                                        </Typography>      
                                    </MenuItem>
                                    <MenuItem value="humidity">
                                        <Typography fontSize={{ xs: "18px", sm: "20px" }} fontWeight="600" color="#296573">
                                            Humidity Trend
                                        </Typography>      
                                    </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid2>                  
                            <Grid2 size={{xs:11}} overflow={"auto"} sx={{ minWidth: 120 }} mb={2} display={'flex'} justifyContent={'center'}>
                                <LineChart
                                    xAxis={[{scaleType: 'point', data: weatherData?.map(point => getDayName(point.datetime)) }]}
                                    series={[
                                        {
                                            data: weatherData?.map((point) =>
                                                filter === "tempmax" ? fahrenheitToCelsius(point[filter]) : point[filter]
                                            ),
                                            area: true, showMark: false ,
                                        }
                                    ]}
                                    width={isXs ? 550 : isSm ? 600 : isMd ? 700 : isLg ? 750 : 900}
                                    height={300}
                                    sx={{
                                        [`& .${areaElementClasses.root}`]: {
                                        fill: 'url(#gradient)',
                                        },
                                        '& .MuiLineElement-root': {
                                            strokeWidth: 0,
                                        },
                                    }}                      
                                >
                                    <defs>
                                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="red" />
                                        <stop offset="50%" stopColor="#ffca00" />
                                        <stop offset="100%" stopColor="#00c9ff"/>
                                    </linearGradient>
                                    </defs>
                                </LineChart>
                            </Grid2>
                        </Grid2>
                    </Grid2>
                    )}
        </>
    );
};

export default MainScreen;
