import React from 'react';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import SettingsIcon from '@material-ui/icons/Settings';
import TrackChangesIcon from '@material-ui/icons/TrackChanges';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import LocalMallIcon from '@material-ui/icons/LocalMall';
import NearMeIcon from '@material-ui/icons/NearMe';
import ReceiptIcon from '@material-ui/icons/Receipt';
import RestaurantIcon from '@material-ui/icons/Restaurant';
import SpaIcon from '@material-ui/icons/Spa';
import {useHistory} from "react-router-dom";


export default function UserBottomNavigation() {
    let history = useHistory();

    const [value, setValue] = React.useState('now');

    const handleChange = (event, newValue) => {
        setValue(newValue);
        let destination;
        if (newValue === "products") {
            destination = "/products/main";
        } else {
            destination = "/" + newValue;
        }
        history.push(destination);
    };

    return (
        <div>
            <BottomNavigation value={value} onChange={handleChange} className="user_bottom_navigation">
                <BottomNavigationAction label="Now" value="now" icon={<NearMeIcon/>}/>
                <BottomNavigationAction label="Products" value="products" icon={<SpaIcon/>}/>
                <BottomNavigationAction label="Recipes" value="recipes" icon={<ReceiptIcon/>}/>
                <BottomNavigationAction label="Dietary programmes" value="programmes" icon={<TrackChangesIcon/>}/>
                <BottomNavigationAction label="Dietary preferences" value="preferences" icon={<FingerprintIcon/>}/>
                <BottomNavigationAction label="Daily menus" value="menus" icon={<RestaurantIcon/>}/>
                <BottomNavigationAction label="Shopping lists" value="shopping" icon={<LocalMallIcon/>}/>
                <BottomNavigationAction label="Settings" value="settings" icon={<SettingsIcon/>}/>
            </BottomNavigation>
        </div>

    );
}