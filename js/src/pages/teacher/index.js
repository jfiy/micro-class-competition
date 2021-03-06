import React from "react";
import { Layout, Divider, Empty, Button, message, Upload, Modal, Popconfirm, Radio } from "antd";
import UserAvatar from "@/components/avatar";
import banner from '@/images/banner.jpg';
import { get, ip } from '@/utils/request'
import bg from '@/images/true.jpeg'
import { Link, Switch, Route } from 'react-router-dom'
import Com from './competition'

class MyUpload extends React.Component {
    state = {}
    uploadProps = {
        name: 'file',
        action: `${ip}/teacher/competition/${this.props.competition_id}/upload`,
        headers: {
            authorization: localStorage.getItem('token'),
        },
        beforeUpload: () => {
            this.setState({
                loading: true
            })
        },
        onChange: info => {
            if (info.file.status === 'uploading') {
                if (info.event) {
                    this.setState({ progress: parseFloat(info.event.percent) })
                }
            }
            if (info.file.status === 'done') {
                this.props.onSuccess()
                this.setState({
                    loading: false
                })
                message.success(`${info.file.name} file uploaded successfully`);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} 上传失败`);
                this.setState({
                    loading: false
                })
            }
        },
    };
    render() {
        return <Upload {...this.uploadProps} ><Button loading={this.state.loading} ghost size="small" icon="upload" >
            {this.state.loading ? parseInt(this.state.progress) + '%' : this.props.title}
        </Button></Upload>
    }
}
class Competition extends React.Component {
    state = { competition: [] };
    componentDidMount() {
        get("/teacher/competition").then(json => {
            this.setState({ competition: json.data.competition })
        })

    }
    handleJoin = id => {
        get(`/teacher/competition/${id}/join`).then(json => {
            if (json.code === 0) {
                message.success("报名成功");
                this.props.onSuccess();
            } else {
                message.error("报名失败");
            }
        })
    }
    render() {
        return <div>
            {this.state.competition.length === 0 && <Empty description={"很遗憾，目前还没有比赛，耐心等待比赛发布"} />}
            <div style={{ width: '100%', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                {this.state.competition.map(com => {

                    if (this.props.type === -2) {
                        if (com.competition_type) {
                            return null
                        }
                    } else if (this.props.type !== -1 && this.props.type !== com.competition_type) {
                        return null
                    }
                    return <div key={com.competition_id} style={{ width: 500, padding: 20, whiteSpace: 'normal', color: '#fff', margin: 20, background: '#0d143c', display: 'inline-block' }}>
                        <div style={{ fontSize: 26, textAlign: 'center', fontWeight: 'lighter' }}>【{com.type_name}】{com.competition_name}</div>
                        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,.6)', paddingBottom: 20 }}>时间：{com.competition_time}</div>
                        <pre style={{ whiteSpace: 'normal', lineHeight: 2, height: 140, overflow: 'hidden' }}>{com.competition_desc}</pre>
                        <div style={{ textAlign: 'right' }}>
                            {
                                com.competition_state === 1 ?
                                    <Button onClick={() => { this.handleJoin(com.competition_id) }} ghost>报名参赛</Button>
                                    : <>当前不可参赛 <Link to={`/teacher/competition/${com.competition_id}`} >查看作品</Link></>
                            }
                        </div>
                    </div>
                })}
            </div>
        </div>
    }
}



class Teacher extends React.Component {
    state = { myCompetition: [], types: [], type: -1 }
    componentDidMount() {
        this.loadMyCompetition();
        get('/teacher/competition/types').then(json => {
            this.setState({ types: json.data })
        })
    }
    loadMyCompetition = () => {
        get('/teacher/micro-class').then(json => {
            this.setState({ myCompetition: json.data })
        })
    }
    handleExit = id => {
        get(`/teacher/competition/${id}/remove`).then(json => {
            this.loadMyCompetition();
        })
    }
    render() {
        return <Layout>
            <Layout.Header style={{ color: '#fff' }}>
                <UserAvatar style={{ float: 'right' }} />
            </Layout.Header>
            <Layout.Content>
                <div style={{ background: `url(${banner}) center`, backgroundSize: 'cover', color: '#fff', padding: 30, textAlign: 'center' }}>
                    <div style={{ fontSize: 46 }}>微 课 竞 赛</div>
                    <div style={{ fontWeight: 'lighter', fontSize: 17, letterSpacing: .4, marginTop: -10 }}>MICRO CLASS COMPETITION</div>
                    <br />
                    <div
                        style={{
                            maxWidth: 900, lineHeight: '40px', margin: '0 auto', textAlign: 'left', fontSize: 16, fontWeight: 'lighter', letterSpacing: 1,
                            textShadow: '0 1px 1px #000'
                        }}
                    >
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;“微课”的核心组成内容是课堂教学视频（课例片段），同时还包含与该教学主题相关的教学设计、素材课件、教学反思、练习测试及学生反馈、教师点评等辅助性教学资源，它们以一定的组织关系和呈现方式共同“营造”了一个半结构化、主题式的资源单元应用“小环境”。<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;因此，“微课”既有别于传统单一资源类型的教学课例、教学课件、教学设计、教学反思等教学资源，又是在其基础上继承和发展起来的一种新型教学资源。<br /><br />
                    </div>
                </div>
                <div>
                    <div style={{ background: '#fff', marginBottom: 10, padding: 20 }}>
                        <Divider >我的参赛</Divider>
                        <div>
                            {this.state.myCompetition.length === 0 && <Empty description={"您还没有参赛作品哦"} />}
                            <div style={{ whiteSpace: 'nowrap', overflowX: 'auto' }}>
                                {this.state.myCompetition.map(com => {
                                    return <div key={com.competition_id} style={{
                                        display: 'inline-block', width: 300, height: 180, whiteSpace: 'normal', margin: 20, background: `url(${bg}) center`,
                                        backgroundSize: 'cover', borderRadius: 10, overflow: 'hidden', color: '#fff', position: 'relative'
                                    }}>
                                        <div style={{ width: '100%', height: '100%', padding: 20, background: 'rgba(0,0,0,.6)' }}>
                                            <div style={{ textAlign: 'center', paddingBottom: 10, fontSize: 18 }}>{com.competition_name}</div>
                                            <div style={{ fontSize: 12, height: 20, overflow: 'hidden' }}>时间：{com.competition_time}</div>
                                            <div>分类：{com.type_name}</div>
                                            <div> 分数：{com.sc ? com.sc : "待结算"} 排行：{com.ranks & com.sc ? com.ranks : "待结算"}</div>
                                            <div style={{ textAlign: 'right', marginTop: 20 }}>
                                                {
                                                    com.competition_state === 1 ? <>
                                                        <Popconfirm
                                                            title="确认退出参赛？" okType="danger" onConfirm={() => { this.handleExit(com.competition_id) }}
                                                        ><Button type="danger" size="small" ghost style={{ position: 'absolute', left: 20 }}>退赛</Button></Popconfirm>
                                                        {com.media && <Button onClick={() => this.setState({ media: com.media })} icon="eye" size="small" ghost style={{ marginRight: 20 }} >预览</Button>}
                                                        <MyUpload onSuccess={this.loadMyCompetition} title={com.media ? '重新上传' : '上传'} competition_id={com.competition_id} />
                                                    </> :
                                                        <>
                                                            {com.media && <Link to={`/teacher/competition/${com.competition_id}`}><Button icon="eye" size="small" ghost style={{ marginRight: 20 }} >查看全部</Button></Link>}
                                                            已结束
                                            </>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                })}
                            </div>
                        </div>
                    </div>
                    <div style={{ background: '#fff', padding: 20 }}>
                        {/* 分类 */}
                        <Radio.Group value={this.state.type} onChange={(e, v) => this.setState({ type: e.target.value })} buttonStyle="solid" style={{ margin: '20px 20px 0 20px' }}>
                            <Radio.Button value={-1}>全部</Radio.Button>
                            {this.state.types.map(t => <Radio.Button key={t.type_id} value={t.type_id}>{t.type_name}</Radio.Button>)}
                            <Radio.Button value={-2}>其它</Radio.Button>

                        </Radio.Group>
                        <Divider >比赛信息</Divider>
                        <Competition type={this.state.type} onSuccess={this.loadMyCompetition} />
                    </div>
                </div>
                <Modal title="作品预览" width={640} bodyStyle={{ padding: "6px 6px 0 6px" }} footer={false} onCancel={() => this.setState({ media: false })} destroyOnClose visible={!!this.state.media}>
                    <video autoPlay style={{ width: "100%" }} controls src={ip + this.state.media}></video>
                </Modal>
            </Layout.Content>
        </Layout>
    }
}

export default () => (
    <Switch>
        <Route path="/teacher/competition/:id" component={Com} />
        <Route path="/teacher" component={Teacher} />
    </Switch>
)