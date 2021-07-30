from SS_ABS_app.models import KnowledgePatternItem, KnowledgePatternManager, KnowledgePatternType, ConjunctKnowledgePatternItem, DisjunctKnowledgePatternItem, QuantKnowledgePatternItem
from django.http import HttpResponse, HttpResponseServerError
import json
from django.views.decorators.csrf import csrf_exempt
import numpy as np

@csrf_exempt
def home(request):
   if request.method == 'POST':
      json_data = json.loads(request.body)
      try:
         dict_data = json_data['data']
         str_type = json_data['type']
      except KeyError:
         raise HttpResponseServerError("Malformed data.")

      np_data = np.array([[0.0, 0.0]])
      key = 1
      while str(key) in dict_data:
         np_data = np.vstack((np_data, np.fromiter(dict_data[str(key)].values(), dtype=np.double)))
         key+=1

      KnowledgePatternManager_obj = KnowledgePatternManager()
      if (str_type == 'conjuncts'):
         pattern = ConjunctKnowledgePatternItem(np_data, KnowledgePatternType.CONJUNCTS)
      elif (str_type == 'disjuncts'):
         pattern = DisjunctKnowledgePatternItem(np_data, KnowledgePatternType.DISJUNCTS)
      elif (str_type == 'disjuncts'):
         pattern = QuantKnowledgePatternItem(np_data, KnowledgePatternType.QUANTS)
      else:
         raise HttpResponseServerError("Wrong type of data.")
      return HttpResponse(str(KnowledgePatternManager_obj.checkInconsistency(pattern).isInconsistent))       
   
   else: return HttpResponse("Wrong request method: POST required.")


