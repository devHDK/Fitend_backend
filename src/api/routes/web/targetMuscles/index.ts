import {ApiRouter} from "../../default"
import * as ctrl from "./targetMuscles-ctrl"

const getTargetMuscles = new ApiRouter({
  name: "",
  method: "get",
  summary: "운동부위 목록",
  tags: ["TargetMuscle"],
  responses: {
    200: {schema: "responses/web/targetMuscles/GetTargetMuscles"}
  },
  handler: ctrl.getTargetMuscles
})

export {
  getTargetMuscles
}
