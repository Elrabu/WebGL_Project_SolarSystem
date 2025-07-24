# Solar System Project

## Features implemented into the Project:
- Basic camera system:
  - Rotation of the camera in all directions
  - Camera zoom
- Texturing:
  - unique Texture on every sphere
- Scene composition:
  - three spheres placed into the scene
  - like a Solar System, one rotates around the center sphere
  - the third sphere rotates around the second sphere relative to its current position
- User interaction:
  - UI slider that control the Animation speed
- Time-based animation:
  - spheres move around each other
  - light is calculated from the middle sphere outwards, creating a shadow on the other sider of the sphere
- Bloom Effect:
  - illuminates the Sun with a bloom effect that is added in post processing

## How do the features work?

### Basic camera system/zoom:
- On the canvas, Mouse movement and Interaction is recorded with a function and stored in variables like `isMouseDown`, `cameraZoom` and `cameraRotation`
- THese variables are then used to set the variables `cameraRotation` and `cameraZoom` which are then used to update the view Matrix so that the Objects are translated and rotated depending on the Camera Angle and Zoom.

### Texturing:
- The texture that are mapped on the spheres are located in the `/textures` folder
- The textures are created and configured as `texture` `texture2` and `texture3`
- when the spheres are drawn, the respective Textures are bound to be used in rendering the current object (`gl.bindTexture(gl.TEXTURE_2D, texture);`)

### Scene composition
- The mesh Data for the sphere is located in `/mesh-data.js`, which is uploaded into the `uploadAttributeData` function 
- the function creates a VAO (Vertex Array Object) where the indices, positions, UVs, and normals are stored
- the attributes are then uploaded to the GPU with each `gl.bufferData(...)` call 
- The `view Matrix`, `projection Matrix` and `model Matrix` are set based on mathematical calculation where each of the spheres shuold be, then they are drawn on the canvas
- the calculation uses the input from a time variable which will be explained in `Time-based animation`

### User interaction:
- The User can interact with the scene through a slider that changes the Animation speed
- the slider value is stored into the `speed` variable which influences the animation speed

### Time-based animation:
- the time variable is automaticall provided by `requestAnimationFrame(render);`
- its used to set the Sun Rotation, the Earth orbiting and rotation and the Moon orbiting and rotation
- using `mat4RotY` the values are added to the respective transformation matrices
- the light is implemented using basic Lambertian diffuse shading in the fragment shader
- the light is treated as a point light from the sun in the middle
- for the earth an moon, the light is calculated from the sphere normals and the light direction
- the sun skips this light calculation to simulate self illumination

### Bloom Effect:
- The bloom effect is created by using post processing on the renderd image on the canvas
- The steps are:
  - the rendered scene is saved into a Framebuffer
  - the bright Areas are extracted with a bright pass filter (`bright-pass.frag`)
  - the bright Areas are blurred with a Gaussian blue (`blur_shader.frag`)
  - the blurred areas are combined with the original Framebuffer (`combine.frag`)

### Why the bloom effect?
- The bloom effect give the sun a nice glow effect like in real life

