import './style.css'
import * as THREE from 'three'
import { Creature } from './creature'

const canvas = document.querySelector<HTMLCanvasElement>('#world')
const creature = new Creature()
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, 800 / 500, 0.1, 100)
camera.position.z = 5

if (canvas) {
    const creatureGeometry = new THREE.SphereGeometry(1,32,16)
    const creatureMaterial = new THREE.MeshBasicMaterial({ color:'orange' })
    const renderer = new THREE.WebGLRenderer({canvas}) //what shall the renderer draw on
    renderer.setSize(800,500)

    renderer.render(scene,camera) //which scene and camera to use to draw
}