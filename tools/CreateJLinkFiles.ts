import * as fs from 'fs';

export function CreateJLinkFiles() {
  	for (let i = 1; i <= 6; i++) {
    	const commands = 
`si swd
device STM32H757ZI_M7
speed 4000
erase
jtagconf -1,-1
connect
loadfile bin/CubeProbe_bl_${i}.hex
r
g
sleep 100
exit`;
		fs.writeFileSync(`jlink/CubeProbe_bl_${i}.jlink`, commands);
	}
	console.log("JLink files created");
}