import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import ModalContainer from './ModalContainer';


interface ImageViewProps {
    isOpened: boolean;
    imageUrl: string;
    setIsOpened: React.Dispatch<React.SetStateAction<boolean>>;
}

const ImageView: React.FC<ImageViewProps> = ({ imageUrl, isOpened, setIsOpened }) => {
    const [width, setWidth] = React.useState(0);

    useEffect(() => {
        Image.getSize(imageUrl, (w, h) => {
            const ratio = w / h;
            setWidth(400 * ratio); // Set width based on a fixed height of 400 
        });
    }, [imageUrl]);

    return (
        <ModalContainer
            visible={isOpened}
            modelStyle={modelStyle.modal}
            setVisible={setIsOpened}
        >
            <View style={modelStyle.imageView}>
                <Image
                    source={{ uri: imageUrl }}
                    style={[modelStyle.image, { width: width / 1.2 }]}
                    resizeMode="contain"
                />
            </View>
        </ModalContainer>
    )
}

const modelStyle = StyleSheet.create({
    modal: {
        backgroundColor: 'transparent',
        borderRadius: 0,
        borderWidth: 0,
    },
    imageView: {
        height: 400,
        borderRadius: 12,
        alignSelf: 'center',
        overflow: 'hidden',
    },
    image: {
        height: "100%",
        width: "100%",
    }
})

export default ImageView