import React, { Component, createContext } from 'react'

const { Provider, Consumer } = createContext()
const withScope = (WrappedComponent) => (props) => (
  <Consumer>{(keep) => <WrappedComponent {...props} keep={keep} />}</Consumer>
)

export class AliveScope extends Component {
  constructor(props) {
    super(props)
    this.nodes = {} //缓存children的真实DOM节点
    this.state = {} //缓存keep-alive中的children实例，通过ref获取到真实DOM，存到nodes中

    this.keep = this.keep.bind(this)
  }

  keep(id, children) {
    return new Promise((resolve) =>
      this.setState(
        {
          [id]: { id, children },
        },
        () => resolve(this.nodes[id])
      )
    )
  }

  render() {
    return (
      <Provider value={this.keep}>
        {this.props.children}
        {/*为了通过ref获取真实Dom，然后会被插入到KeepAlive组件中去，然后这里的被删除*/}
        {Object.values(this.state).map(({ id, children }) => (
          <div
            key={id}
            ref={(node) => {
              this.nodes[id] = node
            }}
          >
            {children}
          </div>
        ))}
      </Provider>
    )
  }
}

@withScope
class KeepAlive extends Component {
  constructor(props) {
    super(props)
    this.init(props)
  }

  init = async ({ id, children, keep }) => {
    // 捕获children属性，缓存，然后通过ref转换为真实dom节点，然后获取
    const realContent = await keep(id, children)
    this.div.appendChild(realContent)
    //如果文档树中已经存在了 realContent，它将从文档树中删除，然后重新插入它的新位置。
  }

  render() {
    return (
      <div
        ref={(node) => {
          this.div = node
        }}
      />
    )
  }
}

export default KeepAlive
