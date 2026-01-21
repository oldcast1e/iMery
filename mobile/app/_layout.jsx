import { View, Text } from 'react-native';

export default function RootLayout() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Hello iMery!</Text>
            <Text style={{ fontSize: 16, marginTop: 10 }}>App is working!</Text>
        </View>
    );
}
