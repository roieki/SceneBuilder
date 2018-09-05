import React, { Component } from 'react'
import * as aframe from 'aframe'
import { getSceneQuery } from '../GraphQL'
import { Query } from 'react-apollo'
import {
    ActivityIndicator,
    Text,
} from 'react-native-web'

import SceneContainer from "./SceneComponents/SceneContainer"

import {
    renderShipContainer,
    renderTextEntity,
    renderChartEntity,
    render3dEntity,
    renderProblemQuestion,
} from "./SceneComponents"

import { animationCoordinates } from "./animationCoordinates"


class Scene extends Component {

    // _getQueryData = (queries) => {
    //     console.log("Get data queries: ", queries)
    //     return queries.map((query, sceneIndex) => {
    //         return (

    //             <Query key={sceneIndex} query={getSceneQuery(query)}>
    //                 {({ loading, error, data }) => {
    //                     if (loading) return <ActivityIndicator color={'#fff'} />
    //                     if (error) return <Text>{`Error: ${error}`}</Text>

    //                     return (
    //                         <a-entity position="0 3 -4">
    //                             {data.scene.id !== "cjl4hc0z3camy0b77y1ameusu" &&
    //                                 this._renderScene(
    //                                     data.scene,
    //                                     [...data.scene.children, data.scene.parent],
    //                                     sceneIndex)
    //                             }
    //                         </a-entity>
    //                     )

    //                 }}
    //             </Query>
    //         )
    //     })

    // }


    _getQueryData = (queries) => {
        return (
            <Query query={getSceneQuery(queries)} variables={{ ["sceneIds"]: queries }} >
                {({ loading, error, data }) => {
                    if (loading) return <ActivityIndicator color={'#fff'} />
                    if (error) return console.log("Error: ")
                    console.log("new scene data: ", data)
                    return (
                        <a-entity position="0 3 -4">
                            {data.scenes.map((scene, sceneIndex) => {
                                return this._renderScene(
                                    scene,
                                    [...scene.children, scene.parent],
                                    sceneIndex)
                            })
                            }
                        </a-entity>
                    )

                }
                }
            </Query>
        )
    }


    componentWillReceiveProps(nextProps) {
        if (nextProps.currentScene !== this.props.currentScene) {
            this.setState({ animate: true })
            setTimeout(() => this.setState({ animate: false }), 1000)
        }

    }

    _chooseRenderer = (semanticLayoutNode) => {
        // TODO: Fill this out
    }

    // _chooseAnimation = () => {
    //     if (this.props.animateSceneTransition) {
    //         return (<a-animation
    //             attribute="position"
    //             delay={`${i * 50}`}
    //             to={animationCoordinates({ x: semanticLayoutNode.position.x, y: semanticLayoutNode.position.y, z: semanticLayoutNode.position.z })}
    //             dur="950"
    //             fill="forwards"
    //         />)
    //     }
    // }


    _renderScene = (scene, checkpoints, sceneIndex) => {
        const { showNeedsRepair } = this.props
        const { semanticLayoutNodes, containerNode, children, parent, pq, id } = scene
        // console.log("Scene id: ", id)

        // console.log("Render Scene data: ", scene)

        const nodes = semanticLayoutNodes.map((semanticLayoutNode, i) => {
            // console.log("semanticLayoutNode: ", semanticLayoutNode)


            const dims = 2
            return (
                <a-entity
                    key={`scene-${i}`}
                    id={`renderScene-${id}`}
                    click-to-navigate={`toScene: ${semanticLayoutNode.navigatesTo ? semanticLayoutNode.navigatesTo.id : "cjlh9wdeqamjp0b17ygkhc7ij"};`}
                // scale={`${1 / divideBy} ${1 / divideBy} ${1 / divideBy}`}
                >
                    {semanticLayoutNode.text && renderTextEntity({ semanticLayoutNode, scene, i, dims, })}
                    {semanticLayoutNode.chart && renderChartEntity({ semanticLayoutNode, scene, i, dims, })}
                    {semanticLayoutNode.physicalModel
                        && semanticLayoutNode.physicalModel.physicalAsset
                        && semanticLayoutNode.physicalModel.physicalAsset.modelType
                        && semanticLayoutNode.physicalModel.physicalAsset.modelType === "OBJ"
                        && render3dEntity({ semanticLayoutNode, scene, i, dims, showNeedsRepair })
                    }
                    {semanticLayoutNode.physicalModel
                        && semanticLayoutNode.physicalModel.physicalAsset
                        && semanticLayoutNode.physicalModel.physicalAsset.modelType
                        && semanticLayoutNode.physicalModel.physicalAsset.modelType === "GEOMETRY"
                        && semanticLayoutNode.physicalModel.physicalAsset.geometry === "ship"
                        && renderShipContainer({ semanticLayoutNode, scene, i, dims, showInfoModal: this.props.showInfoModal, showNeedsRepair }) // TODO: remove showInfoModal?
                    }
                    {this.props.animateSceneTransition && <a-animation
                        attribute="position"
                        delay={`${i * 50}`}
                        to={animationCoordinates({ x: semanticLayoutNode.position.x, y: semanticLayoutNode.position.y, z: semanticLayoutNode.position.z })}
                        dur="950"
                        fill="forwards"
                    />}
                    {!this.props.animateSceneTransition && <a-animation
                        attribute="position"
                        to={`${0} ${0} ${0}`}
                        dur="950"
                        fill="forwards"
                    />}
                </a-entity>
            )
        })

        const getScale = () => {
            return this.props.currentScene.replace(/^#+/i, '') === id.replace(/^#+/i, '') ? 1.3 : 0.01
        }

        console.log("Scene props: ", this.props)
        return (
            <SceneContainer
                key={id}
                id={id}
                nextScale={getScale()} // Fix so this works with single scene
            // nextScale={1.3}
            >
                <a-entity>
                    {nodes}
                    {renderProblemQuestion(pq.text)}
                </a-entity>
            </SceneContainer>
        )
    }


    render() {

        return (
            <a-entity>
                {this._getQueryData(this.props.queries)}
            </a-entity>
        )
    }
}

export default Scene




