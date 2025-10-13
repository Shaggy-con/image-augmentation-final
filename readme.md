
-> To get filePath 
enter pwd command in terminal to get current root folder of the file
give number of images to be generated 

curl -X POST http://127.0.0.1:5000/augment/rotate  \ 
-F "image=@/home/filePath/filename.png" \
-F "num_images=60"   
--output /home/user/filepathToBeStored/output.zip



curl -X POST http://127.0.0.1:5000/augment/random \
  -F "image=@/home/filePath/filename.png" \
  --output /home/user/filepathToBeStored/random_augmented_image.png